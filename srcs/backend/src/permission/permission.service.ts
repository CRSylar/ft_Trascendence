import {Body, Injectable, Req} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";


@Injectable()
export class PermissionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt : JwtService,
    ) {  this.prisma = new PrismaService({rejectOnNotFound: true})}

    //CHECK IF USER IS ADMIN
    async isAdmin(@Req() req, idChat : number) : Promise<boolean> {
        try
        {
            const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
            if (await this.prisma.admin.findUnique({
                where: {
                    idIntra_idChat : {idIntra :data['id'], idChat},
                }
            }))
                return true
        } catch(e : any) {
            return false
        }
    }

    //CHECK IF USER IS MODERATOR
    async isModerator(@Req() req, idChat : number) : Promise<boolean> {
        try
        {
            const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
            if (await this.prisma.moderator.findUnique({
                where: {
                    idIntra_idChat : {idIntra : data['id'], idChat},
                }
            }))
                return true
        } catch(e : any) {
            return false
        }
    }

    async isOwner(@Req() req) : Promise<boolean> {
        try {
            const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
            if (!data)
                return false;
            let user = await this.prisma.user.findUnique({
                where : {
                    idIntra : data['id']
                }
            })
            return user.owner
        } catch (e :any) {
            return  false
        }
    }

    async isSiteAdmin(@Req() req) : Promise<boolean> {
        try {
            const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
            if (!data)
                return false;
            let user = await this.prisma.user.findUnique({
                where : {
                    idIntra : data['id']
                }
            })
            return user.isAdmin || user.owner
        } catch (e :any) {
            return  false
        }
    }

    async isMe(@Req() req, idIntra: string) :Promise<boolean> {
        try {
            const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
            return (idIntra === data['id']);
        } catch (e: any){
            return false
        }
    }

    async cantBeTarget(@Body() body :{idIntra: string, idChat: number}) : Promise<boolean> {
        try {
            let chat = await this.prisma.chat.findUnique({
                where :{
                    id : body.idChat
                },
                include:{
                    admin :true,
                    moderators: true,
                }
            })
            if (chat.admin.find((el:any) => el.idIntra === body.idIntra) != undefined)
                return false
            else if (chat.moderators.find( (el:any) => el.idIntra === body.idIntra) != undefined)
                return false
            else {
                 let user = await this.prisma.user.findUnique({
                     where: {
                         idIntra: body.idIntra
                     }
                 })
                return !(user.owner || user.isAdmin) ;
            }
        } catch (e:any) {
            ErrorDispatcher(e);
        }
    }
}
