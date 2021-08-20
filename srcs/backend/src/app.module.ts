import { Module, CacheModule } from '@nestjs/common';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from "./auth/auth.controller";
import { MatchModule } from './match/match.module';
import { FriendsModule } from './friends/friends.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { WebsocketGateway } from './websocket.gateway';
import { MySessionModule } from './my-session/my-session.module';
import { MySessionService } from "./my-session/my-session.service";
import { MessagesModule } from './messages/messages.module';
import { ChatService } from "./chat/chat.service";
import { MessagesService } from "./messages/messages.service";
import { RMessageService } from './messages/r-message.service';
import { WsgameModule } from './wsgame/wsgame.module';
import { AuthService } from "./auth/auth.service";
import { BlacklistModule } from './blacklist/blacklist.module';
import { NotifyModule } from './notify/notify.module';
import * as redisStore from 'cache-manager-redis-store';
import {NotifyService} from "./notify/notify.service";
import {UserService} from "./user/user.service";
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
      PrismaModule,
      AuthModule,
      MatchModule,
      FriendsModule,
      UserModule,
      ChatModule,
      MySessionModule,
      MessagesModule,
      WsgameModule,
      BlacklistModule,
      CacheModule.register({
          store: redisStore,
          host: 'rediStatus',
          port: 6379
      }),
      ClientsModule.register([
          {
              name: 'NOTIFY_SERVICE',
              transport: Transport.TCP
          },
      ]),
      NotifyModule,
      PermissionModule,
  ],
  controllers: [
      AppController,
      AuthController
  ],
  providers: [
      AppService,
      WebsocketGateway,
      MySessionService,
      ChatService,
      MessagesService,
      RMessageService,
      AuthService,
      NotifyService,
      UserService
  ],
})
export class AppModule {}
