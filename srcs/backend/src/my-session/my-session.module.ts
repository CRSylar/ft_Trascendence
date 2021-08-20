import { CacheModule, Module } from '@nestjs/common';
import { MySessionService } from './my-session.service';
import { MySessionController } from './my-session.controller';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [CacheModule.register({
		store: redisStore,
		host: 'rediStatus',
		port: 6379
	})],
    controllers: [MySessionController],
    providers: [MySessionService]
})
export class MySessionModule {}
