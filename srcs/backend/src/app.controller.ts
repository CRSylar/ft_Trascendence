import {Controller, Get, Param, UseGuards} from '@nestjs/common';

import {EventPattern, Payload} from "@nestjs/microservices";
import {IFollower, IMatch, INotify, CNotifyFollowed, TNotify, CNotifyGame} from "../types/Types";
import {AppService} from './app.service';
import {PrismaService} from './prisma/prisma.service';
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import {Observable} from "rxjs";
import ErrorDispatcher from "./error-dispatcher/error-dispatcher";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {this.prisma = new PrismaService({rejectOnNotFound: true,})}

    @UseGuards(JwtAuthGuard)
    @Get('user/:id')
    async findOne(@Param('id') id:string): Promise<any> {
        try {
            return await this.prisma.user.findUnique({
                where: {
                idIntra: id,
                }
            })
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    @EventPattern("new_added")
    friendAdded(@Payload() payload : IFollower ) : Observable<any> {
        let notify : CNotifyFollowed = new CNotifyFollowed(payload)
        this.appService.exec('add_friend', notify);
        return;
    }

    @EventPattern("rmv_friend")
    friendRemoved(@Payload() payload : IFollower ) : Observable<any> {
        let notify : CNotifyFollowed = new CNotifyFollowed(payload);
        this.appService.exec('pvt_change', notify.content.userId);
        this.appService.exec('rmv_friend_notification', notify);
        return;
    }

    @EventPattern("blockUser")
    handleBlockUnblocReq(@Payload() idIntra : string) : Observable<any> {
      this.appService.exec('pvt_change', idIntra);
      return ;
    }

    @EventPattern("game_request")
    gameRequest(@Payload() payload : IMatch ) : Observable<INotify> {
        this.appService.exec('game_req', new CNotifyGame(payload));
        return;
    }

    @EventPattern('public_update')
    updateUser(@Payload() payload : any) : Observable<any>{
      this.appService.exec('pvt_change', payload.idIntra);
      this.appService.exec('public_update', payload);
        return;
    }

    @EventPattern('banned')
    banUser(@Payload() payload: any) : Observable<any> {
      this.appService.exec('ban_user', payload);
      return ;
    }

    @EventPattern('remove_participant')
    removeParticipant(@Payload() payload : any) : Observable<any> {
      this.appService.exec('remove_participant' , payload);
      return;
    }

    @EventPattern('ban_participant')
    banParticipant(@Payload() payload : any) : Observable<any> {
        this.appService.exec('ban_participant' , payload);
        return;
    }

    @EventPattern('new_admin')
    newAdmin(@Payload() payload : any) : Observable<any> {
        this.appService.exec('new_admin' , payload);
        return;
    }

    @EventPattern('rmv_admin')
    removeAdmin(@Payload() payload : any) : Observable<any> {
        this.appService.exec('remove_admin' , payload);
        return;
    }

    @EventPattern('new_moderator')
    newModerator(@Payload() payload : any) : Observable<any> {
        this.appService.exec('new_moderator' , payload);
        return;
    }

    @EventPattern('rmv_moderator')
    removeModerator(@Payload() payload : any) : Observable<any> {
        this.appService.exec('remove_moderator' , payload);
        return;
    }

    @EventPattern("rmv_chat")
    removeChat(@Payload() idChat : number) : Observable<any> {
        this.appService.exec('remove_chat' , idChat);
        return;
    }
}
