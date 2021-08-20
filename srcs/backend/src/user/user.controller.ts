import {
    Body,
    Controller,
    Get, HttpException,
    HttpStatus,
    Param,
    Post,
    Query, Req, UseGuards
} from '@nestjs/common';

import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "./user.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {JwtService} from "@nestjs/jwt";
import {PermissionService} from "../permission/permission.service";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";


@Controller('users')
export class UserController {
    constructor(
        private jwt: JwtService,
        private readonly prisma: PrismaService,
        private readonly userService : UserService,
        private readonly permissionService : PermissionService,
    ) {this.prisma = new PrismaService({rejectOnNotFound: true,})}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async showMe(@Req() req) : Promise<any> {
        const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
        return await this.userService.showProfile(data['id'])
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile/:idIntra')
    async showProfile(@Param('idIntra') query : string) : Promise<any> {
       return  await this.userService.showStats(query)
    }

    // @Get('stats')
    // async showStats(@Query('idIntra') query : string) : Promise<any> {
    //     return await this.userService.showStats(query)
    // }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async showUsers() : Promise<any> {
        return await this.userService.showUsers()
    }

    @UseGuards(JwtAuthGuard)
    @Post('activate/2fa/:id')
    async activate2fa(@Param('id') id: string, @Req() req) : Promise<HttpStatus> {
        try {
            let user = await this.prisma.user.findUnique({
                where:{
                    id : Number(id)
                }
            })
            if (await this.permissionService.isMe(req, user.idIntra))
                return await this.userService.activate2fa(Number(id))
            else
                throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
        } catch (e :any) {
            ErrorDispatcher(e);
        }
    }

    @Post('deactivate/2fa/:id')
    async deactivate2fa(@Param('id') idIntra: string, @Req() req) : Promise<any> {
        try {
            if (await this.permissionService.isMe(req, idIntra) || await this.permissionService.isSiteAdmin(req)){
                return await this.userService.deactivate2fa(idIntra)
            }
            else
                throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
        } catch (e :any) {
            ErrorDispatcher(e);
        }
    }

    @Post('update/showedname/')
    async changeShowedName(@Body() body , @Req() req) : Promise<any> {
        if (await this.permissionService.isMe(req, body.idIntra))
            return await this.userService.changeShowedName(body)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('update/changeAvatar/')
    async changeAvatar(@Body() body, @Req() req) : Promise<any> {
        if (await this.permissionService.isMe(req, body.idIntra))
            return await this.userService.changeAvatar(body)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('update/phone/')
    async changePhone(@Body() body, @Req() req) : Promise<any> {
        if (await this.permissionService.isMe(req, body.idIntra))
            return await this.userService.changePhone(body);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('update/mail/')
    async changeMail(@Body() body, @Req() req) : Promise<any> {
        if (await this.permissionService.isMe(req, body.idIntra))
            return await this.userService.changeMail(body);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('permaban')
    async banUser(@Body() body, @Req() req) : Promise<any> {
        if (await this.permissionService.isSiteAdmin(req))
            return await this.userService.banUser(body);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('unBan')
    async unBanUser(@Body() body, @Req() req) : Promise<any> {
        if (await this.permissionService.isSiteAdmin(req))
            return await this.userService.unBanUser(body);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('addAdmin')
    async addAdmin(@Body() body, @Req() req) : Promise<void> {
        if (await this.permissionService.isOwner(req))
            return await this.userService.addUserSiteAdmin(body)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('removeAdmin')
    async removeAdmin(@Body() body, @Req() req) : Promise<void> {
        if (await this.permissionService.isOwner(req))
            return await this.userService.removeUserSiteAdmin(body)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Get('findUserByName/:query')
    async findUserByName(@Param('query') query) : Promise<any[]> {
        return await this.userService.findUserByName(query);
    }
}
