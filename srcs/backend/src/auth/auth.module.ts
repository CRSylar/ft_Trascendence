import { CacheModule, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from "../prisma/prisma.service";
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from "./jwt.strategy";
import * as redisStore from 'cache-manager-redis-store';
import { MySessionService } from "../my-session/my-session.service";


@Module({
  imports: [
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
      })
],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, MySessionService],
  exports: [JwtModule],
})
export class AuthModule {}
