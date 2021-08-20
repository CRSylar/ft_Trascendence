import {
	Injectable,
	CACHE_MANAGER,
	Inject
} from '@nestjs/common';

import { Cache } from 'cache-manager';
import AbstractMessageStore from './AbstractMessageStore';
import Message from "./entities/message.entity";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {NotifyService} from "../notify/notify.service";


@Injectable()
export class RMessageService extends AbstractMessageStore{
    constructor(@Inject(CACHE_MANAGER) private messageManager: Cache)
    {
        super();
    }

    async saveMessage(message : Message) : Promise<void> {
        try {
	        let fullchat: Array<Message> = await this.messageManager.get(message.idChat);
	        if (!fullchat) {
		        fullchat = Array<Message>();
	        }
	        fullchat.push(message);
	        let ret = await this.messageManager.set(message.idChat, fullchat, {ttl: 0});

        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async deleteMessages(chatId : string) : Promise<any> {
        await this.messageManager.del(chatId);
    }

    async findMessagePerChat(chatId : string) : Promise<any> {
        try {
	        let fullchat: Array<Message> = await this.messageManager.get(chatId);
	        if (!fullchat)
		        return Array<{}>();
	        return fullchat;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async findMessagesForUser(idUser : string) : Promise<any> {
	    try {
		    return;
	    } catch (e) {
            ErrorDispatcher(e)
	    }
    }

    async findMessagesPerUser(idUser : string) : Promise<any> {
        try {
            return ;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async findAll() : Promise<any> {
        try {
            return ;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }
}
