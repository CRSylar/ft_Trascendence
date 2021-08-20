import {
  Controller,
    Get,
    Post,
    Body,
    Param,
    Inject,
    CACHE_MANAGER
} from '@nestjs/common';

import { RMessageService } from './r-message.service';
import { PrismaService } from "../prisma/prisma.service";
import { Cache } from 'cache-manager';
import Message from "./entities/message.entity";

@Controller('messages')
export class MessagesController {
  constructor(  @Inject(CACHE_MANAGER) private  messageStore : Cache,
                private readonly messagesService: RMessageService,
                private readonly prisma: PrismaService) {
      this.prisma = new PrismaService();
      this.messagesService = new RMessageService(this.messageStore);
  }

  // @Post()
  // async createMessage(@Body() body: Message) : Promise<void> {
  //   await this.messagesService.saveMessage(body);
  // };
  //
  //
  // @Get()
  // async findAll() : Promise< Map<string, Array<Message>> > {
  //     return await this.messagesService.findAll();
  // }
  //
   @Post('chat')
   async findMessagePerChat(@Body() body : any) : Promise<Array<any>> {
     return await this.messagesService.findMessagePerChat(body.idChat);
   }
}
