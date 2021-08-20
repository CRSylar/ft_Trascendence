import {Controller, Delete, Get, HttpException, HttpStatus, Param, Req, UseGuards} from '@nestjs/common';
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {NotifyService} from "./notify.service";
import {AppService} from "../app.service";
import {CNotifyFollowed} from "../../types/Types";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {PermissionService} from "../permission/permission.service";
import {not} from "rxjs/internal-compatibility";

@Controller('notify')
export class NotifyController {
    constructor(
        private readonly permissionService: PermissionService,
        private readonly notifyService : NotifyService,
        private observer : AppService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Delete('follower/:idNotify')
    async deleteFollowNotify(@Param('idNotify') id : string, @Req() req) {
        try {
            let notify : CNotifyFollowed = await this.notifyService.getFollowerNotify(id);
            if (!await this.permissionService.isMe(req, notify.content.friendId))
                throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
            let res : CNotifyFollowed[] = await this.notifyService.delFollowedNotification(id)
            res.forEach((notify : CNotifyFollowed) => this.observer.exec("notify_rmv_friend", notify))
        } catch (e) {
            console.log("Error on delete follow notify", e)
            ErrorDispatcher(e)
        }
    }

}
