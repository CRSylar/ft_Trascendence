import { CacheModule, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { RMessageService } from './r-message.service';
import { MessagesController } from './messages.controller';
import { PrismaService } from "../prisma/prisma.service";
import * as redisStore from 'cache-manager-redis-store';

@Module({
	imports: [CacheModule.register({
		store: redisStore,
		host: 'redisMessage',
		port: 6378
	})],
  controllers: [MessagesController],
  providers: [RMessageService, MessagesService, PrismaService]
})
export class MessagesModule {}
