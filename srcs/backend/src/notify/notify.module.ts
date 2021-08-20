import {CacheModule, Module} from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import * as redisStore from 'cache-manager-redis-store';
import { ClientsModule, Transport } from "@nestjs/microservices";
import {PrismaService} from "../prisma/prisma.service";
import {AppService} from "../app.service";
import {PermissionModule} from "../permission/permission.module";
import {PermissionService} from "../permission/permission.service";
import {AuthService} from "../auth/auth.service";
import {AuthModule} from "../auth/auth.module";

@Module({
	imports:[PermissionModule, AuthModule,
		ClientsModule.register([
			{
				name: 'NOTIFY_SERVICE',
				transport: Transport.TCP,
			},
		]),
		CacheModule.register({
			store: redisStore,
			host: 'redisNotify',
			port: 6377
		}),
	],
    controllers: [NotifyController],
    providers: [NotifyService, PrismaService, AppService, PermissionService, AuthService]
})
export class NotifyModule {}
