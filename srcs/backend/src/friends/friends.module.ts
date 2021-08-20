import {CacheModule, Module} from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PrismaService } from "../prisma/prisma.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import {AuthService} from "../auth/auth.service";
import {PermissionService} from "../permission/permission.service";
import {PermissionModule} from "../permission/permission.module";
import {AuthModule} from "../auth/auth.module";
import * as redisStore from 'cache-manager-redis-store';


@Module({
    imports:[PermissionModule,AuthModule,
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
        }),
    ],
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService, AuthService, PermissionService]
})
export class FriendsModule {}
