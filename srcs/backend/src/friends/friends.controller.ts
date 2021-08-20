import {
    Body,
    Controller,
    Get, HttpException, HttpStatus,
    Post, Req
} from '@nestjs/common';

import { FriendsService } from "./friends.service";
import { PrismaService } from "../prisma/prisma.service";
import { PermissionService } from "../permission/permission.service";

@Controller('friends')
export class FriendsController {
    constructor(
        private readonly permissionService : PermissionService,
        private readonly prisma: PrismaService,
        private readonly friendsService: FriendsService
    ) {this.prisma = new PrismaService({rejectOnNotFound: true,})}

    @Post('add')
    async addFriend(@Body() friend : any, @Req() req) : Promise<void> {
        if (await this.permissionService.isMe(req, friend.userId))
            await this.friendsService.addFriend(friend)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('remove')
    async removeFriend(@Body() friend, @Req() req) : Promise<void> {
        if (await this.permissionService.isMe(req, friend.userId))
            await this.friendsService.removeFriend(friend)
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

     @Get('show')
     async showFriends(@Req() req) : Promise<any> {
        if (await this.permissionService.isSiteAdmin(req))
            return await this.prisma.friends.findMany();
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
     }
}
