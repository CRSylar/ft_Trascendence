import {CacheModule, Module} from '@nestjs/common';
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { PrismaService } from "../prisma/prisma.service";
import {UserModule} from "../user/user.module";
import {UserService} from "../user/user.service";
import {ClientsModule, Transport} from "@nestjs/microservices";
import * as redisStore from 'cache-manager-redis-store';
import {AuthService} from "../auth/auth.service";
import {AuthModule} from "../auth/auth.module";
import {MySessionService} from "../my-session/my-session.service";
import {MySessionModule} from "../my-session/my-session.module";
import {PermissionModule} from "../permission/permission.module";
import {PermissionService} from "../permission/permission.service";

@Module({
  imports: [UserModule, AuthModule, MySessionModule, PermissionModule,
      ClientsModule.register([
          {
              name: 'NOTIFY_SERVICE',
              transport: Transport.TCP,
          },
      ]),
      CacheModule.register({
          store: redisStore,
          host: 'rediStatus',
          port: 6379
      })
  ],
  controllers: [BlacklistController],
  providers: [BlacklistService, PrismaService, UserService, AuthService, MySessionService, PermissionService]
})
export class BlacklistModule {}
