import {CacheModule, Module} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PrismaService } from "../prisma/prisma.service";
import {JwtModule} from "@nestjs/jwt";
import {PrismaModule} from "../prisma/prisma.module";
import {AuthModule} from "../auth/auth.module";
import * as redisStore from 'cache-manager-redis-store';



@Module({
  imports :[PrismaModule, AuthModule,
      JwtModule.register({
        secret: process.env.SECRET,
        signOptions: {
          expiresIn: '1d'
        }
      }),
      CacheModule.register({
          store: redisStore,
          host: 'rediStatus',
          port: 6379
      }),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PrismaService],
  exports: [PermissionService]
})
export class PermissionModule {}
