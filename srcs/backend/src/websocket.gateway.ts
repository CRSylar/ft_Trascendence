import {
    IChat,
    IMessage, CNotifyFollowed, CNotifyMessage,
    ISession, IMessageNotify, IJoinPublicChat
} from "../types/Types";

import {
	Logger,
	UseGuards,
	Inject,
	CACHE_MANAGER, HttpStatus
} from "@nestjs/common";

import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
}  from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { Cache, caching } from 'cache-manager';
import { PrismaService } from "./prisma/prisma.service";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { JwtService } from '@nestjs/jwt';
import { ChatService } from "./chat/chat.service";
import { RMessageService } from "./messages/r-message.service";
import { MySessionService } from "./my-session/my-session.service";
import { AppService } from "./app.service";
import { NotifyService } from "./notify/notify.service";
import { UserService } from "./user/user.service";
import Message from './messages/entities/message.entity'
import * as redisStore from 'cache-manager-redis-store';
import ErrorDispatcher from "./error-dispatcher/error-dispatcher";
import {EventPattern, Payload} from "@nestjs/microservices";
import {Observable} from "rxjs";


@WebSocketGateway(4041, { transports: ['websocket'] , path: "/socket.io"})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly prisma: PrismaService,
        private jwt: JwtService,
        private readonly chatService : ChatService,
        private messagesService : RMessageService,
        private sessionService : MySessionService,
        private userService : UserService,
        private observer : AppService,
        private readonly notifyService : NotifyService,
        @Inject(CACHE_MANAGER) private cacheManager : Cache,
    ) {
		this.observer.add('public_update', this.emitPublicUpdate);
        this.observer.add('pvt_change', this.emitPrivateChange);
		this.observer.add('public_chat', this.emitPublicChat);
		this.observer.add('add_friend', this.emitAddFriend);
		this.observer.add('rmv_friend_notification', this.deleteFollowedNotification);
		this.observer.add('notify_rmv_friend', this.emitDeleteFollow);
        this.observer.add('ban_user', this.emitBanUser);
        this.observer.add('game_req', this.emitGameReq);
		this.observer.add('online', this.emitUserOnline);
	    this.observer.add('in_game', this.emitUserInGame);
	    this.observer.add('message_notification', this.emitMessageNotify);
	    this.observer.add('deleteGameNotification', this.emitDeleteGameReq);
		this.observer.add('remove_participant', this.emitRemoveParticipant)
		this.observer.add('remove_chat', this.emitRemoveChat)
		this.observer.add('ban_participant', this.emitBannedParticipant)
	    this.observer.add('new_admin', this.emitAddedAsAdmin)
	    this.observer.add('rmv_admin', this.emitRemovedAsAdmin)
	    this.observer.add('new_moderator', this.emitAddedAsModerator)
	    this.observer.add('rmv_moderator', this.emitRemovedAsModerator)

        this.prisma = new PrismaService({rejectOnNotFound: true,});
        this.notifyService = new NotifyService(caching(
		        {
			        store: redisStore,
			        host: 'redisNotify',
			        port: 6377,
			        ttl : 0
		        }
	        ), this.prisma, this.observer)
        this.messagesService = new RMessageService(
        	caching(
		        {
			        store: redisStore,
			        host: 'redisMessage',
			        port: 6378,
			        ttl : 0
		        }
	        ));
        this.sessionService = new MySessionService(this.cacheManager);
    }

    async verifyIdentity(idIntra : string, socketId : string) : Promise<boolean> {
    	let realSocket = await this.sessionService.findSession(idIntra);
    	if (!realSocket || realSocket.socketId != socketId)
    		return false;
    	return true;
	}

	async verifyParticipantOfChat(idIntra : string, idChat : number) : Promise<boolean> {
    	try {
    		const participant = await this.prisma.participant.findUnique({
			    where : {
				    idIntra_idChat : {idIntra, idChat}
			    }
		    })
		    return participant && !participant.muted;
	    } catch (e) {
		    return false
	    }
	}

	async isSiteAdmin(idIntra : string) : Promise<boolean> {
    	try {
		    const user = await this.prisma.user.findUnique({
			    where : {
			    	idIntra : idIntra
			    }
		    })
		    return user.owner || user.isAdmin
	    } catch (e : any) {
		    console.log("user not found", e);
	    }
	}

	emitRemoveParticipant = async (payload : {idIntra : string, idChat : number}) => {
    	try {
    		console.log("emit_rmv_participant", payload)
			const session : ISession = await this.sessionService.findSession(payload.idIntra);
    		const max = await this.notifyService.delMessagesNotification(payload.idIntra, payload.idChat)
			if (session && session.status != "offline") {
				this.server.to(session.socketId).emit('readSuccess', {
					idChat : payload.idChat,
					last : max
				});
				this.server.to(session.socketId).emit("removedFromChat", payload)
				this.server.sockets.connected[session.socketId].leave(payload.idChat);
			}
		} catch (e:any) {
    		console.log('Error in emitRemoveParticipant =>', e);
		}
	}

	emitRemoveChat = async (idChat : number) : Promise<any> => {
		try {
			let chatParticipants = await this.chatService.showParticipant(String(idChat));
			await this.chatService.deleteChat(Number(idChat));
			await this.messagesService.deleteMessages(String(idChat));
			await this.notifyService.delMessagesNotificationPerChat(Number(idChat));
			await Promise.all(chatParticipants.map( async (participant) => {
				let idParticipant : ISession = await this.sessionService.findSession(participant.idIntra);
				if (idParticipant && idParticipant.status != 'offline') {
					this.server.to(idParticipant.socketId).emit('chatRemoved', {idChat: Number(idChat)});
					this.server.sockets.connected[idParticipant.socketId].leave(Number(idChat));
				}
			}));
		}
		catch (e) {
			console.log(e.message, "<== Errore in deleteChat WS-Chat")
		}
	}

	emitBannedParticipant = async (payload : {idIntra : string, idChat : number}) => {
		try {
			const session : ISession = await this.sessionService.findSession(payload.idIntra);
			const max = await this.notifyService.delMessagesNotification(payload.idIntra, payload.idChat)
			if (session && session.status != "offline") {
				this.server.to(session.socketId).emit('readSuccess', {
					idChat : payload.idChat,
					last : max
				});
				this.server.to(session.socketId).emit("bannedFromChat", payload)
				this.server.sockets.connected[session.socketId].leave(payload.idChat);
			}
		} catch (e:any) {
			console.log('Error in emitRemoveParticipant =>', e);
		}
	}

	emitAddedAsAdmin = async (payload : {idIntra : string, idChat : number}) => {
    	const session : ISession = await this.sessionService.findSession(payload.idIntra);
    	if (session && session.status != "offline")
    		this.server.to(session.socketId).emit("addedAsAdmin", payload)
	}

	emitAddedAsModerator = async (payload : {idIntra : string, idChat : number}) => {
		const session : ISession = await this.sessionService.findSession(payload.idIntra);
		if (session && session.status != "offline")
			this.server.to(session.socketId).emit("addedAsModerator", payload)
	}

	emitRemovedAsAdmin = async (payload : {idIntra : string, idChat : number}) => {
		const session : ISession = await this.sessionService.findSession(payload.idIntra);
		if (session && session.status != "offline")
			this.server.to(session.socketId).emit("removedAsAdmin", payload)
	}

	emitRemovedAsModerator =  async (payload : {idIntra : string, idChat : number}) => {
		const session : ISession = await this.sessionService.findSession(payload.idIntra);
		if (session && session.status != "offline")
			this.server.to(session.socketId).emit("removedAsModerator", payload)
	}

    emitMessageNotify = (payload : {idChat : number, notify : CNotifyMessage}) => {
	    this.server.to(payload.idChat).emit("messageNotification", payload.notify)
    }

    emitPublicChat = async (payload : any) => {
        try {
            this.server.sockets.emit('publicChat', payload);
        }catch (e) {
            console.log("Unhandled error on emitPublicChat ==>", e.message)
        }
    }

    emitBanUser = async (payload: any) => {
    	try {
    		let status : ISession = await this.sessionService.findSession(payload.idIntra);
    		if (status && status.status != "offline")
    			this.server.to(status.socketId).emit('banned', payload);
        } catch (e) {
            console.log("Unhandled error on emitBanUser ==>", e.message)
        }
	}

    emitPublicUpdate = async (payload : any) => {
    	try {
    		await this.notifyService.updateFollowerNotification(payload);

		    this.server.sockets.emit('public_update', payload);
	    } catch (e) {
		    console.log("Unhandled error on emitPublicUpdate ==> ", e.message)
	    }
    }

    emitAddFriend = async(payload : any) => {
        try {
            this.notifyService.setNotify(payload.content.friendId, payload);
            let friendStatus: ISession = await this.sessionService.findSession(payload.content.friendId);
            if (friendStatus && friendStatus.status != "offline") {
                this.server.to(friendStatus.socketId).emit('addedAsFriend', payload);
            }
            let myStatus: ISession = await this.sessionService.findSession(payload.content.userId);
            if (myStatus && myStatus.status != "offline") {
                let user = await this.userService.showProfile(payload.content.userId);
                this.server.to(myStatus.socketId).emit('userUpdate', user)
            }
        } catch (e) {
            console.log("Unhandled error on emitAddFriend ==> ", e.message)
        }
    }

    emitPrivateChange = async (idIntra : string) => {
        try {
            let myStatus: ISession = await this.sessionService.findSession(idIntra);
            if (myStatus && myStatus.status != "offline") {
                let user = await this.userService.showProfile(idIntra);
                this.server.to(myStatus.socketId).emit('userUpdate', user)
            }
        } catch (e) {
            console.log("Unhandled error on emitRmvFriend ==> ", e.message)
        }
    }

    emitGameReq = async (payload : any) => {
    	try {
		    if (payload.content.idIntra === payload.content.idIntraFriend)
			    return;
		    let friendStatus: ISession = await this.sessionService.findSession(payload.content.idIntra);
		    if (friendStatus && friendStatus.status != "offline") {
			    this.notifyService.setNotify(payload.content.idIntra, payload);
			    this.server.to(friendStatus.socketId).emit('gameReq', payload);
		    }
		    let owner: ISession = await this.sessionService.findSession(payload.content.idIntraFriend);
		    if (owner && owner.status != "offline")
			    this.server.to(owner.socketId).emit('gameReqFail', payload)
	    } catch (e) {
		    console.log("UnhWS-Unhandled error [emitGameReq] ==> ", e.message)
	    }
    }

	emitDeleteGameReq = async  (payload : any) => {
    	try {
			await this.notifyService.delGameNotification(payload.idP2, payload.idP1);
			let requestedPlayerSession : ISession = await this.sessionService.findSession(payload.idP2);
			if (requestedPlayerSession && requestedPlayerSession.status != "offline")
				this.server.to(requestedPlayerSession.socketId).emit("deleteGameNotification", {
					idIntra : payload.idP2,
					idIntraFriend : payload.idP1
				})
	    } catch (e) {
		    console.log("Error on emitDeleteGameReq ==> ", e)
	    }
	}

    deleteFollowedNotification = async (payload : CNotifyFollowed) => {
        let res = await this.notifyService.delFollowedNotification(payload.id);
        if (res) {
            await this.emitDeleteFollow(payload)
        }
    }

    emitDeleteFollow = async (notify : CNotifyFollowed) => {
        let notifyTo : ISession = await this.sessionService.findSession(notify.content.friendId);
        if (notifyTo && notifyTo.status != "offline")
            this.server.to(notifyTo.socketId).emit("removeFollowed", notify)
    }

    emitUserOnline = (payload : any) => {
    	this.server.sockets.emit("online", payload)
	}

	emitUserInGame = (payload : any) => {
    	this.server.sockets.emit("in_game", payload.idIntra);
	}

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('WebsocketGateway');


    @SubscribeMessage('msgToServer')
    async handleMessage(client: Socket, payload: any): Promise<void> {
    	try {
    		if (!(await this.verifyIdentity(client.idIntra, client.id)) ||
				!(await this.verifyIdentity(payload.content.sender, client.id)) ||
		        !(await this.verifyParticipantOfChat(client.idIntra, Number(payload.to))))
    			return ;
		    let message: Message = payload.content;
		    message['idChat'] = payload.to;
		    this.messagesService.saveMessage(message);
		    this.notifyService.notifyAllChatParticipants(Number(payload.to), message);
		    this.server.to(payload.to).emit('msgToClient', payload);
	    } catch (e) {
		    console.log("Error: ", e.message)
	    }
    }

	@SubscribeMessage('isTyping')
	handleTyping(client: Socket, payload: any): void {
		this.server.to(payload.to).emit('isTyping', payload);
	}

    afterInit(server: Server) {
    	console.log('Init Chat');
    }

    @UseGuards(JwtAuthGuard)
    async handleConnection(client: Socket, ...args: any[]): Promise<any> {
        try {
        	let session = await this.sessionService.findSession(client.handshake.query.auth);
        	if (session && session.status !== 'offline') {
        		client.emit('alreadyLoggedIn', 'Stai a fotte coi negri Sbagliati');
				client.to(session.socketId).emit('alreadyLoggedIn', 'Stai a fotte coi negri Sbagliati');
				return ;
			}
        	else {
	        this.sessionService.saveSession(client.handshake.query.auth, {
		        status: "online",
		        socketId: client.id
	        });
	        client.idIntra = client.handshake.query.auth;
	        let chats = await this.prisma.participant.findMany({
		        where: {
			        idIntra: client.handshake.query.auth,
		        },
	        });
	        let chatEntries = await Promise.all(chats.map(async (chat) => {
		        client.join(chat.idChat);
		        let chatEntry: IChat;
		        chatEntry = await this.chatService.showChat(chat.idChat);
	            chatEntry.msg = await this.messagesService.findMessagePerChat(String(chat.idChat));
	            chatEntry.readUntil = await this.notifyService.getReadUntil(chat.idChat);
		        return chatEntry;
	        }));
	        let notifications = await this.notifyService.getNotify(client.handshake.query.auth);
			this.server.sockets.emit("online", client.handshake.query.auth)
	        this.server.to(client.id).emit('loadChats', chatEntries);
            this.server.to(client.id).emit("loadNotifications", notifications);
			let publicChats = await this.chatService.showPublicUserNotIn(client.idIntra);
			this.server.to(client.id).emit("loadPublicChats", publicChats);
        	}
        } catch (e) {
            console.log(e.message, "<== Errore in handle connection WS-OldChat")
        }
    }


    @SubscribeMessage('createChatRequest')
    async createChatRequest(client : Socket, payload : any) : Promise<void> {
        try {
        	if (!(await this.verifyIdentity(payload.chat.idIntra, client.id)) ||
				payload.chat.idIntra != client.idIntra)
        		return ;
	        let chat = {
		        idIntra: payload.chat.idIntra,
		        name: payload.chat.name,
		        types: payload.chat.types,
	        };
			payload.chat.pwd ? chat['pwd'] = payload.chat.pwd : 0;
			let chatEntry: any = await this.chatService.createChat(chat);
	        if (!chatEntry)
		        return;
	        await Promise.all(payload.partecipants.map(async (partecipant) => {
	            await this.chatService.addParticipant({
		        idChat: chatEntry.id,
		        idIntra: partecipant.idIntra,
	        }) }
	        ));

	        client.join((chatEntry.id));
	        this.server.to(client.id).emit('joinChatRequest', {
                idChat: chatEntry.id
            } );
	        payload.partecipants.map(async (partecipant) => {
		        let clientId = await this.sessionService.findSession(partecipant.idIntra);
		        if (clientId && clientId.status != "offline")
			        this.server.to(clientId.socketId).emit('joinChatRequest', {
			            idChat: chatEntry.id
			        });
	        })
			if (chat.types === "public") {
				payload.chat.id = chatEntry.id
				this.server.sockets.emit("newPublicChat", payload.chat)
				console.log(payload.chat);
			}
        } catch (e) {
            console.log(e.message, "<== Errore in createChatRequest WS-OldChat")
        }
    }

    @SubscribeMessage('joinPublicChat')
	async joinPublicChat(client : Socket, payload : IJoinPublicChat) {
        try {
	        let join : boolean = await this.chatService.checkJoinChat(payload);
	        if (!join || !(await this.verifyIdentity(payload.idIntra, client.id))) {
		        this.server.to(client.id).emit('joinFailure', {
		        	req : payload,
			        error : HttpStatus.FORBIDDEN
		        });
		        return ;
			}
			await this.chatService.addParticipant({
			   idChat : payload.idChat,
			   idIntra: payload.idIntra
			});
			client.join((payload.idChat));
			this.server.to(client.id).emit('joinChatRequest', {
			   idChat : payload.idChat
			});
			let user = await this.prisma.user.findUnique({
				where : {
					idIntra : client.idIntra,
				},
				select : {
					id : true,
					idIntra : true,
					img : true,
					userName : true
				}
			})
			this.server.to(payload.idChat).emit('newParticipant', {idChat: payload.idChat, user})
        } catch (e) {
            console.log(e.message, "<== Errore in JoinPublicChat")
        }
    }

    @SubscribeMessage('joinChatCli')
    async joinChatRequest(client : Socket, payload : any) : Promise<any> {
    	try {
		    if (!(await this.verifyIdentity(client.idIntra, client.id)) ||
				(!(await this.verifyParticipantOfChat(client.idIntra, payload.idChat)) &&
			    !(await this.isSiteAdmin(client.idIntra))))
		    	return ;
	        let chat = await this.chatService.showChat(payload.idChat);
            chat.msg =  await this.messagesService.findMessagePerChat(String(chat.id));
            chat.readUntil = 0;
            client.join(payload.idChat);
            this.server.to(client.id).emit('joinSuccess', chat);
        }
        catch (e) {
	        console.log(e.message, "<== Errore in joinChatRequest WS-OldChat")
        }
    }

	@SubscribeMessage('spyChatCli')
	async spyChatRequest(client : Socket, payload : any) : Promise<any> {
		try {
			if (!(await this.verifyIdentity(client.idIntra, client.id)) ||
				(
					!(await this.isSiteAdmin(client.idIntra))))
				return ;
			let chat = await this.chatService.showChat(payload.idChat);
			chat.msg =  await this.messagesService.findMessagePerChat(String(chat.id));
			chat.readUntil = 0;
			client.join(payload.idChat);
			this.server.to(client.id).emit('spySuccess', chat);
		}
		catch (e) {
			console.log(e.message, "<== Errore in joinChatRequest WS-OldChat")
		}
	}

	@SubscribeMessage('stopSpyChat')
	async stopSpyChat(client : Socket, payload : any) : Promise<any> {
		try {
			if (!(await this.verifyIdentity(client.idIntra, client.id)) ||
				(
					!(await this.isSiteAdmin(client.idIntra))))
				return ;
			client.leave(Number(payload.idChat))
		}
		catch (e) {
			console.log(e.message, "<== Errore in joinChatRequest WS-OldChat")
		}
	}

    @SubscribeMessage('leaveChat')
	async leaveChat(client: Socket, info : any) :Promise<any> {
    	try {
			if (!(await this.verifyIdentity(info.idIntra, client.id)))
				return ;
			client.leave(info.idChat);
			await this.chatService.leaveChat(info)
			const chats = await this.chatService.showPublicUserNotIn(client.idIntra);
			this.server.to(client.id).emit('chatUpdate', {idChat : info.idChat, chats :chats});
			this.server.to(info.idChat).emit('someoneHasLeft', {idChat: info.idChat , idIntra : client.idIntra })
		} catch (e :any) {
		    console.log(e.message, "<== Errore in joinChatRequest WS-OldChat")
		}
	}

    @SubscribeMessage('deleteChat')
    async deleteChat(client : Socket, idChat : string) : Promise<any> {
        try {
	        if (!(await this.verifyIdentity(client.idIntra, client.id)) ||
				!(await this.chatService.canUserDeleteChat(client.idIntra, Number(idChat))))
        		return ;
            this.emitRemoveChat(Number(idChat))
        }
        catch (e) {
            console.log(e.message, "<== Errore in deleteChat WS-Chat")
        }
    }

	@SubscribeMessage('readChatUntil')
	async readChatUntil(client : Socket, notification : CNotifyMessage) {
		await this.notifyService.delMessagesNotification(client.idIntra, notification.content.idChat)
	}

	@SubscribeMessage('readChat')
	async readChat(client : Socket, idChat : number) {
    	if (!(await this.verifyIdentity(client.idIntra, client.id)))
    		return ;
		const max = await this.notifyService.delMessagesNotification(client.idIntra, idChat);
		this.server.to(client.id).emit('readSuccess', {
			idChat : idChat,
			last : max
		});
		const readUntil = await this.notifyService.getReadUntil(idChat);
		this.server.to(idChat).emit("lastMessageRead", {
			idChat : idChat,
			readUntil : readUntil
		})
	}

	@SubscribeMessage('firstLogin')
	async resetFirstLogin(client : Socket, idIntra: string) {
    	await this.prisma.user.update({
		    where : {
		    	idIntra : idIntra
		    },
		    data : {
		    	firstLogin : false
		    },
	    })
		this.emitPrivateChange(idIntra);
	}

    handleDisconnect(client: Socket) {
    	this.sessionService.saveSession(client.handshake.query.auth, {
            status: "offline",
            socketId: client.id
        });
        this.server.sockets.emit("offline", client.handshake.query.auth)
    }
}
