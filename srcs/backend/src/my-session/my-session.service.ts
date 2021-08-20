import {
	Injectable,
	CACHE_MANAGER,
	Inject
} from '@nestjs/common';

import { ISession } from "../../types/Types";
import { Cache } from 'cache-manager';
import AbstractSessionStorage from './AbstractSessionStorage';
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";

@Injectable()
export class MySessionService extends AbstractSessionStorage{
  private readonly sessions: Map<string, ISession>;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
    this.sessions = new Map<string, ISession>();
  }

  async saveSession(id : string, session : ISession) {
	  try {
		  await this.cacheManager.set(id, session, {ttl: 0})
	  } catch (e) {
          ErrorDispatcher(e)
	  }
  }

  async findSession(userId : string) : Promise<any> {
	  try {
		  let session: any = await this.cacheManager.get(userId)
		  return session;
	  } catch (e) {
          ErrorDispatcher(e)
	  }
  }

  async findAllSessions() : Promise< Map<string, ISession> > {
	  try {
		  return await this.sessions;
	  } catch (e) {
          ErrorDispatcher(e)
	  }
  }
}
