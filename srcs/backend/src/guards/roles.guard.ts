import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { Reflector } from '@nestjs/core';
import {UserService} from "../user/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private jwt: JwtService,
        private readonly userService : UserService,
        private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getClass());
        if (!roles) {
            console.log("roles" + roles);
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const data = await this.jwt.verifyAsync(request.cookies['tshdc'])
        const user = await this.userService.showProfile(data.id);

        for (let role in roles) {
            if (role === 'admin') {
                if (user.admin.find( (admn :any) => admn.idChat == request.body.idChat ) != undefined)
                    return true;
            }
            else if (role === 'moderator') {
                if (user.admin.find( (admn :any) => admn.idChat == request.body.idChat ) != undefined)
                    return true;
                if (user.moderators.find( (mod :any) => mod.idChat == request.body.idChat ) != undefined)
                    return true;
            }
        }
        console.log("ciao");
        return false;
    }
}
