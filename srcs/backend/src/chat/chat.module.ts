import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from "../prisma/prisma.service";
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import {PermissionService} from "../permission/permission.service";
import {PermissionModule} from "../permission/permission.module";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  imports: [PermissionModule,
      ClientsModule.register([
          {
              name: 'NOTIFY_SERVICE',
              transport: Transport.TCP,
          },
      ]),
    JwtModule.register({
        secret: process.env.SECRET,
        signOptions: {
            expiresIn: '1d'
        }
    }),
    UserModule
],
  controllers: [ChatController],
  providers: [ChatService, PrismaService, PermissionService]
})
export class ChatModule {}
