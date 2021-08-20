import { CacheModule, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from "../prisma/prisma.service";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import * as redisStore from 'cache-manager-redis-store';
import {ClientsModule, Transport} from "@nestjs/microservices";
import {MySessionService} from "../my-session/my-session.service";
import {MySessionModule} from "../my-session/my-session.module";
import {PermissionModule} from "../permission/permission.module";
import {PermissionService} from "../permission/permission.service";

@Module({
    imports: [AuthModule, MySessionModule,PermissionModule,
        CacheModule.register({
            store: redisStore,
            host: 'rediStatus',
            port: 6379
        }),
        ClientsModule.register([
            {
                name: 'NOTIFY_SERVICE',
                transport: Transport.TCP,
            },
        ])
    ],
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthService, MySessionService, PermissionService],
  exports: [UserService]
})
export class UserModule {}
