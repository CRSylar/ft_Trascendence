import {
    Body,
    Controller,
    Get, HttpException, HttpStatus,
    Param,
    Post, Req
} from '@nestjs/common';

import { BlacklistService } from "./blacklist.service";
import {PermissionService} from "../permission/permission.service";

@Controller('blacklist')
export class BlacklistController {
    constructor(
        private permissionService : PermissionService,
        private readonly blacklistService : BlacklistService,
    ) {}

    @Post('add')
    async addBlock(@Body() block : any, @Req() req) : Promise<void> {
       if (await this.permissionService.isMe(req, block.myIdIntra))
           await this.blacklistService.addBlock(block);
       else
           throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Post('remove')
    async removeBlock(@Body() sblock: any, @Req() req) : Promise<any> {
        if (await this.permissionService.isMe(req, sblock.myIdIntra))
            await this.blacklistService.removeBlock(sblock);
        else
            throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }

    @Get('show/:id')
    async showBlocked(@Param("id") userId : string, @Req() req) : Promise<any> {
    if (await this.permissionService.isSiteAdmin(req))
        return await this.blacklistService.showBlocked(userId);
    else
        throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
    }
}
