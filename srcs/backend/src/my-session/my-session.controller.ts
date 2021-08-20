import {
  Controller,
    Get,
    Post,
    Body,
    Param,
    Inject,
    CACHE_MANAGER
} from '@nestjs/common';

import { MySessionService } from './my-session.service';
import { Cache } from 'cache-manager';

@Controller('my-session')
export class MySessionController {
  constructor(private readonly mySessionService: MySessionService,
              @Inject(CACHE_MANAGER) private cacheManager: Cache) {
        this.mySessionService = new MySessionService(this.cacheManager);
  }

  // @Get()
  // async getSessions() : Promise<any>{
  //   return await this.mySessionService.findAllSessions();
  // }
  //
  // @Post()
  // async addSession(@Body() body) {
  //   await this.mySessionService.saveSession(body.id, body.session);
  // }
  //
  // @Get(':id')
  // async findSession(@Param('id') id : string) : Promise<any> {
  //   return await this.mySessionService.findSession(id);
  // }
}
