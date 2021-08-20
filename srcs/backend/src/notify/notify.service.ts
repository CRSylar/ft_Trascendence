import {
	CACHE_MANAGER,
	Inject,
	Injectable
} from '@nestjs/common';

import {
	IFollower,
	INotify,
	CNotifyFollowed,
	CNotifyGame,
	CNotifyMessage, ISession,
	TNotify
} from "../../types/Types";

import { Store } from 'cache-manager';
import { Server } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import Message from "../messages/entities/message.entity";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {MySessionService} from "../my-session/my-session.service";
import {AppService} from "../app.service";


@Injectable()
export class NotifyService {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Store,
	    private readonly prisma : PrismaService,
		private observer : AppService
	) { }

	async setNotify(idIntra : string, notification : INotify) : Promise<void> {
		switch (notification.type) {
			case TNotify.followed : {
				await this.setFollowedNotification(idIntra, notification)
				return ;
			}
			case TNotify.game_req : {
				await this.setGameNotification(idIntra, notification)
				return ;
			}
			case TNotify.message : {
				await this.setMessageNotification(idIntra, notification)
				return ;
			}
			default : {
				ErrorDispatcher({
					message : "Unknown Notify Type"
				})
			}
		}
	}

	async setFollowedNotification(idIntra : string, notification : CNotifyFollowed) : Promise<void> {
		let notify : CNotifyFollowed = notification;
		await this.cacheManager.set(`${idIntra}${notify.type}${notify.content.userId}`, notification, { ttl : 604800000 });
		return ;
	}

	async setGameNotification(idIntra : string, notification : CNotifyGame) : Promise<void> {
		let notify : CNotifyGame = notification;
		await this.cacheManager.set(`${idIntra}${notify.type}${notify.content.idIntraFriend}`, notification, { ttl : 604800000 });
		return ;
	}

	async setMessageNotification(idIntra : string, notification : CNotifyMessage) : Promise<void> {
		let notify : CNotifyMessage = notification;
		await this.cacheManager.set(`${notify.type}${notify.content.idChat}${idIntra}-${notify.content.timestamp}`, notification, { ttl : 0 });
		return ;
	}

	async notifyAllChatParticipants(idChat : number, message : Message) {
		try {
			let participants = await this.prisma.participant.findMany({
				where: {
					idChat: idChat
				}
			});
			let notifyEntry: CNotifyMessage;
			notifyEntry = new CNotifyMessage({
				idChat: idChat,
				idSender : message.sender,
				timestamp: message.timestamp,
				userName: message.userName
			});
			await Promise.all(participants.map(async (participant) => {
				await this.setMessageNotification(participant.idIntra, notifyEntry);
			}))
			this.observer.exec("message_notification", {idChat: idChat, notify : notifyEntry})
		} catch (e) {
			ErrorDispatcher(e);
		}
	}

	async getFollowerNotify(id : string) : Promise<INotify> {
		let n : any = await this.cacheManager.get(id);
		console.log('PROVA =>', n)
		return n;
	}

	async getNotify(idIntra : string) : Promise<Map<string, any> > {
		let map : any = Object()
		map["followed"] = await this.getFollowNotification(idIntra);
		map["message"] = await this.getMessageNotification(idIntra);
		return map;
	}

	async getReadUntil(idChat : number) : Promise<number> {
		let notifyKeys = await this.cacheManager.keys(`${TNotify.message}${idChat}*`);
		if (!notifyKeys || !notifyKeys.length)
			return Date.now();
		console.log("notifies key",notifyKeys)
		let min : number = -1;
		let temp : number;
		notifyKeys.forEach((key : string) => {
			temp = Number(key.split("-")[1])
			if (min < 0)
				min = temp
			min = min > temp ? temp : min;
		})
		return min
	}

	async getGameNotification(idIntra : string) : Promise<INotify[]> {
		let notifyKeys = await this.cacheManager.keys(`${idIntra}${TNotify.game_req}*`);
		if (!notifyKeys)
			return [];
		let notify : CNotifyGame;
		let notifyObj : INotify;
		let notifiesCont : INotify[] = await Promise.all(notifyKeys.map(async (notifyKey) => {
			notify = await this.cacheManager.get(notifyKey);
			notifyObj = notify;
			return notifyObj;
		}))
		return notifiesCont;
	}

	async getFollowNotification(idIntra : string) : Promise<INotify[]> {
		let notifyKeys = await this.cacheManager.keys(`${idIntra}${TNotify.followed}*`);
		if (!notifyKeys)
			return [];
		let notify : CNotifyFollowed;
		let notifyObj : INotify;
		let notifiesCont : INotify[] = await Promise.all(notifyKeys.map(async (notifyKey) => {
			notify = await this.cacheManager.get(notifyKey);
			notifyObj = notify;
			return notifyObj;
		}))
		notifiesCont = notifiesCont.sort((a : INotify, b : INotify) => a.timestamp - b.timestamp)
		return notifiesCont;
	}

	async getMessageNotification(idIntra : string) : Promise<Map<string, INotify[]>> {
		let map = Object();
		let notifyKeys = await this.cacheManager.keys(`${TNotify.message}*${idIntra}-*`);
		if (!notifyKeys)
			return map;
		let notify : CNotifyMessage;
		let notifyObj : INotify;
		let notifiesCont : INotify[] = await Promise.all(notifyKeys.map(async (notifyKey) => {
			notify = await this.cacheManager.get(notifyKey);
			notifyObj = notify;
			if (notify) {
				if (!map.hasOwnProperty(String(notify.content.idChat))) {
					map[notify.content.idChat] = []
				}
				map[notify.content.idChat].push(notifyObj)
			}
		}))
		for(var value in map)
			map[value].sort((a : INotify, b : INotify) => a.timestamp - b.timestamp)
		return map
	}

	async updateFollowerNotification(user : any) {
		let notifications = await this.cacheManager.keys(`*${TNotify.followed}${user.idIntra}`);
		let notificationEntry : INotify;
		let followerContent : IFollower;
		await Promise.all(notifications.map(async (notifyKey) => {
			notificationEntry = await this.cacheManager.get(notifyKey);
			followerContent = {
				userId : notificationEntry.content.userId,
				friendId : notificationEntry.content.friendId,
				img : user.img,
				userName : user.userName
			}
			notificationEntry.content = followerContent;
			return await this.cacheManager.set(notifyKey, notificationEntry);
		}))
	}

	async delGameNotification(idIntraReceiver : string, idIntraSender : string) : Promise<void> {
		let notifies = await this.cacheManager.keys(`${idIntraReceiver}${TNotify.game_req}${idIntraSender}`);
		await Promise.all(notifies.map(async (notify) => await this.cacheManager.del(notify)))
	}

	async delMessagesNotification(idIntra : string, idChat : number) {
		let notifications = await this.cacheManager.keys(`${TNotify.message}${idChat}${idIntra}*`);
		let max : number = -1;
		let notification : CNotifyMessage;
		await Promise.all(notifications.map(async (notify) => {
			notification = await this.cacheManager.get(notify);
			max = notification.content.timestamp > max ? notification.content.timestamp : max;
			await this.cacheManager.del(notify)
		}))
		return max
	}

	async delMessagesNotificationPerChat(idChat : number) {
		let notifications = await this.cacheManager.keys(`${TNotify.message}${idChat}*`);
		await Promise.all(notifications.map(async (notify) => {
			return await this.cacheManager.del(notify)
		}));
	}

	async delFollowedNotification(id : string) : Promise<CNotifyFollowed[] | null> {
		let notifications = await this.cacheManager.keys(`${id}`);
		if (!notifications)
			return null;
		let notifies : CNotifyFollowed[] = await Promise.all(notifications.map(async (notify : string) => await this.cacheManager.get(notify)))
		await Promise.all(notifications.map(async (notify : CNotifyFollowed) => await this.cacheManager.del(notify)))
		return notifies;
	}
}
