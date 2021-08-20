import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import AbstractMessageStore from './AbstractMessageStore';
import Message from "./entities/message.entity";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";


@Injectable()
export class MessagesService  extends AbstractMessageStore{

    private static msgStore: Map<string, Array<Message> >

    constructor(
        private readonly prisma: PrismaService
    ){
        super();
        MessagesService.msgStore = new Map<string, Array<Message> >();
        this.prisma = new PrismaService({rejectOnNotFound: true,})
    }


    async findMessagesForUser(idUser : string) : Promise< Map<string,Array<Message>> > {
	    try {
		    let chats = await this.prisma.participant.findMany({
			    where: {
				    idIntra: idUser,
			    }
		    });

		    let ret = new Map<string, Array<Message>>();

		    chats.forEach((chat) => {
			    ret[chat.idChat] = MessagesService.msgStore[chat.idChat]
		    })

		    return ret;
	    } catch (e : any) {
            ErrorDispatcher(e)
	    }
    }

    async findMessagesPerUser(idUser : string) : Promise< Map<string, Array<Message>> > {
        try {
	        let chats = await this.prisma.participant.findMany({
		        where: {
			        idIntra: idUser,
		        }
	        });

	        let ret = new Map<string, Array<Message>>();

	        chats.forEach((chat) => {
		        ret[chat.idChat] = MessagesService.msgStore[chat.idChat].map(
			        (msg: Message) => {
				        if (msg.sender === idUser) return msg;
			        })
	        })

	        return ret;
        } catch (e : any) {
            ErrorDispatcher(e)
        }
    }

    async findMessagePerChat(idChat: string) : Promise<Array<Message> > {
        try {
	        MessagesService.msgStore[idChat] ? 0 : MessagesService.msgStore[idChat] = Array<Message>();
	        // console.log("find msg x chat", idChat, MessagesService.msgStore[idChat])
	        return await (MessagesService.msgStore[idChat]);
        } catch (e : any) {
            ErrorDispatcher(e)
        }
    }

    async findAll() : Promise< Map<string, Array<Message> > > {
	    try {
		    return await MessagesService.msgStore;
	    } catch (e : any) {
            ErrorDispatcher(e)
	    }
    }

    async saveMessage(message : Message) : Promise<void> {
	    try {
		    if (!MessagesService.msgStore[message.idChat]) {
			    MessagesService.msgStore[message.idChat] = new Array<Message>();
		    }
	        MessagesService.msgStore[message.idChat].push(message);
        } catch (e : any) {
            ErrorDispatcher(e)
	    }
    }
}
