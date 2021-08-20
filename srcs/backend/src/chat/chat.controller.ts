import {
    Body,
    Controller,
    Delete,
    Get, HttpException, HttpStatus,
    Param,
    Post,
    Query, Req, UseGuards
} from '@nestjs/common';

import { ChatService } from "./chat.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {PermissionService} from "../permission/permission.service";

@Controller('chat')
export class ChatController {
    constructor(
        private permissionService : PermissionService,
        private chatService: ChatService
    ) { }

    // CREZIONE CHAT

    // @UseGuards(JwtAuthGuard)
    // @Post('create')
    // async createChat(@Body() chat : any,) : Promise<any> {
    //     return await this.chatService.createChat(chat);
    // }
    //
	// // RICERCA CHAT SPECIFICA
    // @UseGuards(JwtAuthGuard)
    // @Get('open/:id')
	// async openChat(@Param('id') id : string) : Promise<any> {
	// 	return await this.chatService.showChat(parseInt(id))
	// }

    // AGGIUNTA ADMIN
    @UseGuards(JwtAuthGuard)
    @Post('addadmin')
    async addAdmin(@Body() admin : any, @Req() req) : Promise<void> {
        if (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, admin.idChat))
            await this.chatService.addAdmin(admin);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // RIMOZIONE ADMIN
    @UseGuards(JwtAuthGuard)
    @Delete('removeadmin')
    async removeAdmin(@Body() admin : any, @Req() req) : Promise<void> {
        if (await this.permissionService.isSiteAdmin(req))
            await this.chatService.removeAdmin(admin);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // AGGIUNTA MOD
    @UseGuards(JwtAuthGuard)
    @Post('addmod')
    async addMod(@Body() moderator : any, @Req() req) : Promise<void> {
        if (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, moderator.idChat))
            await this.chatService.addMod(moderator);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // RIMOZIONE MOD
    @UseGuards(JwtAuthGuard)
    @Delete('removemod')
    async removeMod(@Body() moderator : any, @Req() req) : Promise<void> {
        if (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, moderator.idChat))
            await this.chatService.removeMod(moderator);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // MOSTRA ADMIN CHAT
    // @UseGuards(JwtAuthGuard)
    // @Get('showadmin')
    // async showAdmin(@Query('idChat') idChat : string) : Promise<any> {
    //     return await this.chatService.showAdmin(idChat)
    // }

    // AGGIUNTA PARTECIPANTE
    @UseGuards(JwtAuthGuard)
    @Post('addparticipant')
    async addParticipant(@Body() participant : any, @Req() req) : Promise<void> {
        if (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, Number(participant.idChat)))
            await this.chatService.addParticipant(participant);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // RIMOZIONE PARTECIPANTE
    @UseGuards(JwtAuthGuard)
    @Delete('removeparticipant')
    async removeParticipant(@Body() participant : any, @Req() req) : Promise<void> {
        if ( await this.permissionService.cantBeTarget(participant) &&
            (
                await this.permissionService.isSiteAdmin(req) ||
                await this.permissionService.isAdmin(req, Number(participant.idChat)) ||
                await this.permissionService.isModerator(req,  Number(participant.idChat))
            )
        )
            await this.chatService.removeParticipant(participant)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // BAN USER
    @UseGuards(JwtAuthGuard)
    @Post('banUser')
    async banUser(@Body() banReq : any, @Req() req) : Promise<void> {
        if (await this.permissionService.cantBeTarget(banReq) && (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, Number(banReq.idChat)) ||
            await this.permissionService.isModerator(req,  Number(banReq.idChat))) )
            await this.chatService.banUser(banReq)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // MUTE PARTICIPANT
    @UseGuards(JwtAuthGuard)
    @Post('muteParticipant')
    async muteParticipant(@Body() muteReq : any, @Req() req) : Promise<void> {
        if (await this.permissionService.cantBeTarget(muteReq) && (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, Number(muteReq.idChat)) ||
            await this.permissionService.isModerator(req,  Number(muteReq.idChat))) && await this.permissionService.cantBeTarget(muteReq))
            await this.chatService.muteParticipant(muteReq)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // UNMUTE PARTICIPANT
    @UseGuards(JwtAuthGuard)
    @Post('unmuteParticipant')
    async unmuteParticipant(@Body() unMuteReq : any, @Req() req) : Promise<void> {
        if (  await this.permissionService.cantBeTarget(unMuteReq) && (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, Number(unMuteReq.idChat)) ||
            await this.permissionService.isModerator(req,  Number(unMuteReq.idChat))) )
            await this.chatService.unmuteParticipant(unMuteReq)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // UTENTE LASCIA LA CHAT
    @UseGuards(JwtAuthGuard)
    @Post('leavechat')
    async leaveChat(@Body() me : any) : Promise<void> {
        await this.chatService.leaveChat(me);
    }

    // MOSTRA PARTECIPANTI CHAT
    // @UseGuards(JwtAuthGuard)
    // @Get('showparticipant')
    // async showParticipant(@Query('idChat') idChat : string) : Promise<any> {
    //     return await this.chatService.showParticipant(idChat)
    // }

    // MOSTRA TUTTE LE CHAT DI UN UTENTE
    @UseGuards(JwtAuthGuard)
    @Get('show/:id')
    async showChatPerUser(@Param('id') id : string, @Req() req) : Promise<any> {
        if (await this.permissionService.isMe(req, id))
            return await this.chatService.showChatPerUser(id);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // RITORNA TUTTE LE CHAT PRESENTI NEL DATABASE
    @UseGuards(JwtAuthGuard)
    @Get('show')
    async showChat(@Req() req) : Promise<any> {
        if (await this.permissionService.isSiteAdmin(req))
            return await this.chatService.showChats()
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // TUTTE LE CHAT PUBLICHE
    @UseGuards(JwtAuthGuard)
    @Get('public')
    async showPublic() : Promise<any> {
        return await this.chatService.showPublic()
    }

    // TUTTE LE CHAT PRIVATE
    @UseGuards(JwtAuthGuard)
    @Get('private')
    async showPrivate(@Req() req) : Promise<any> {
        if (await this.permissionService.isSiteAdmin(req))
            return await this.chatService.showPrivate()
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @UseGuards(JwtAuthGuard)
    @Post('updatePwd')
    async updateChatPwd(@Body() body : { idChat : number, pwd : string }, @Req() req) : Promise<void> {
        if (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, body.idChat))
            await this.chatService.updateChatPwd(body);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // ELIMINA UNA CHAT SPECIFICA
    @UseGuards(JwtAuthGuard)
    @Delete('delete')
    async deleteChat(@Body() body : any, @Req() req) : Promise<any> {
        if (await this.permissionService.isSiteAdmin(req) || await this.permissionService.isAdmin(req, Number(body.id)))
            return await this.chatService.deleteChat(Number(body.id));
    else
        throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    // SVUOTA TUTTE LE CHAT DAL DB
    @UseGuards(JwtAuthGuard)
    @Delete('emptyChats')
    async emptyChat(@Req() req) : Promise<any> {
        if (await this.permissionService.isOwner(req))
            return await this.chatService.emptyChat();
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }
}

