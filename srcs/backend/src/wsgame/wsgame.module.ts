import { CacheModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { WsgameService } from './wsgame.service';
import { PrismaModule } from "../prisma/prisma.module";
import { MySessionModule } from "../my-session/my-session.module";
import { AuthModule } from "../auth/auth.module";
import { AuthController } from "../auth/auth.controller";
import { MySessionService } from "../my-session/my-session.service";
import { AuthService } from "../auth/auth.service";
import { WebsocketGameGateway } from "./wsgame.gateway";
import { AppService } from "../app.service";
import { AppController } from "../app.controller";
import { MatchController } from "../match/match.controller";
import { MatchService } from "../match/match.service";
import { MatchModule } from "../match/match.module";
import * as redisStore from 'cache-manager-redis-store';


@Module({
    imports: [PrismaModule, MySessionModule, AuthModule, MatchModule,
        CacheModule.register( {
            store: redisStore,
            host: 'rediStatus',
            port: 6379,
            ttl : 0,
        }),
        ClientsModule.register([
            {
                name: 'NOTIFY_SERVICE',
                transport: Transport.TCP
            },
        ])],
    controllers: [AuthController, AppController, MatchController],
  providers: [WsgameService, MySessionService, AuthService, WebsocketGameGateway, AppService, MatchService]
})
export class WsgameModule {}
