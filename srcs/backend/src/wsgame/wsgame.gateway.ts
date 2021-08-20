import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway, WebSocketServer
} from '@nestjs/websockets';

import {
	CACHE_MANAGER,
	Inject,
	UseGuards
} from "@nestjs/common";

import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from "../prisma/prisma.service";
import { MySessionService } from "../my-session/my-session.service";
import { Cache } from "cache-manager";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AppService } from "../app.service";
import { ClientProxy } from "@nestjs/microservices";
import { MatchService } from "../match/match.service";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {ISession} from "../../types/Types";

enum eMatch {
	classic,
	sd,
	mc,
	full,
}


interface IQuery {
	user: string, // Nome utente visualizzato
	idIntra: string,
	matchType: eMatch,
	pvt : boolean,
	friend? : string,
	idIntraFriend?: string, // id Intra dell'amico da invitare
	spectator? : string,
}

interface IJson {
	user: string, // Nome utente visualizzato
	idIntra: string,
	matchType: string,
	pvt : string,
	friend? : string,
	idIntraFriend?: string, // id Intra dell'amico da invitare
	spectator? : string,
}

let QUEUE = new Map();
let pvtQUEUE = new Map();

function parseQuery(query: IJson) {
	let ret = {} as IQuery;

	ret.user = query.user;
	ret.idIntra = query.idIntra;
	switch (query.matchType) {
		case "0":
			ret.matchType = eMatch.classic;
			break;
		case "1":
			ret.matchType = eMatch.sd;
			break;
		case "2":
			ret.matchType = eMatch.mc;
			break;
		case "3":
			ret.matchType = eMatch.full;
			break;
		default:
			break;
	}
	ret.pvt = query.pvt === "false" ? false : true;
	if (query.hasOwnProperty("friend"))
		ret.friend = query.friend;
	if (query.hasOwnProperty("spectator"))
		ret.spectator = query.spectator;
	if (query.hasOwnProperty("idIntraFriend"))
		ret.idIntraFriend = query.idIntraFriend;
	return ret;
}

@WebSocketGateway(4042, { transports: ['websocket'] , path: "/socket.io"})
export class WebsocketGameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly prisma: PrismaService,
		private jwt: JwtService,
		private sessionService : MySessionService,
		private notifyService: AppService,
		private matchApi : MatchService,
		@Inject('NOTIFY_SERVICE') private event: ClientProxy,
		@Inject(CACHE_MANAGER) private cacheManager : Cache,
	) {
		this.sessionService = new MySessionService(this.cacheManager);
	}

	@WebSocketServer() server: Server;


	afterInit(server: Server) {
		console.log('Init Game-Socket OK');
	}

	@UseGuards(JwtAuthGuard)
	async handleConnection(client: Socket, ...args: any[]): Promise<any> {
	    let session : ISession = await this.sessionService.findSession(client.handshake.query.idIntra)
		await this.sessionService.saveSession(client.handshake.query.idIntra, {
            status : "in-game",
            socketId : session.socketId
        })
		this.notifyService.exec("in_game", {
			idIntra : client.handshake.query.idIntra
		})
		let query : IQuery = parseQuery(client.handshake.query);

		//SPETTATORE
		if (query.hasOwnProperty("spectator")) {
			let finded : boolean = false;
			QUEUE.forEach((value, key) => {
				if (key.id === query.spectator)
					finded = true;
			})
			pvtQUEUE.forEach((value, key) => {
				if (key.id === query.spectator)
					finded = true;
			})
			if (finded){
				client.join(query.spectator)
				this.server.to(client.id).emit('spectator', {
					idGame: query.spectator
				})
			}
			else
				client.disconnect(true);
		}
		//GIOCATORE MATCH MAKING
		else if (!query.pvt)
		{
			let finded : Socket = null;
			QUEUE.forEach((value, key) => {
				if (value.mtype === query.matchType && value.userName2 === "" && value.userName1 !== query.user)
					finded = key;
			})
			if (finded === null)
			{
				QUEUE.set(client, {
					mtype: query.matchType,
					userName1: query.user,
					userName2: "",
					player1: client.id,
					player2: ""
				});
				// emit gameReq
			}
			else
			{
				let name1 = "";
				let name2 = "";
				client.join(finded.id);
				QUEUE.forEach((value, key) => {
					if (key === finded)
					{
						value.player2 = client.id;
						value.userName2 = query.user;
						name1 = value.userName1;
						name2 = value.userName2
					}
				})

				await this.matchApi.createMatch({
						idP1: finded.handshake.query.idIntra,
						idP2: query.idIntra,
						idGame: finded.id,
					})

				this.server.to(finded.id).emit('start-game', {
					idGame : finded.id,
					idP1 : finded.id,
					idP2 : client.id,
					name1: name1,
					name2: name2,
					matchType: query.matchType,
					seed: Math.floor(Math.random() * 1000000)
				});
			}
		}
		//GIOCATORE PRIVATO
		else if (query.pvt) {
			// FILTRO MULTI RICHIESTA
			if (query.user == "undefined" && query.idIntra == "undefined")
				return
			let finded : Socket = null;
			pvtQUEUE.forEach((value, key) => {
				// SECONDO FILTRO MULTI RICHIESTA
				if (value.idIntra1 === query.idIntra && value.idIntra2 === query.idIntraFriend || value.player2 != "")
				{
					finded = -1
					return
				}
				else if (value.idIntra2 === query.idIntra && value.idIntra1 === query.idIntraFriend)
					finded = key;
			})
			if (finded == -1)
				return
			if (finded === null)
			{
				pvtQUEUE.set(client, {
					mtype: query.matchType,
					userName1: query.user,
					idIntra1: query.idIntra,
					userName2: query.friend,
					idIntra2: query.idIntraFriend,
					player1: client.id,
					player2: ""
				});
				this.event.emit('game_request', {
					user: query.friend, // nome visualizzato invitato
					idIntra: query.idIntraFriend, // id Intra invitato
					matchType: query.matchType,
					pvt : true,
					friend : query.user, // nome visualizzato dell'amico che ti ha invitato
					idIntraFriend: query.idIntra, // id Intra dell'amico che ti ha invitato
					link: `/game?id=${query.idIntra}&name=${query.user}`
				})
			}
			else
			{
				let name1 = "";
				let name2 = "";
				client.join(finded.id);
				pvtQUEUE.forEach((value, key) => {
					if (key === finded)
					{
						value.player2 = client.id;
						name1 = value.userName1;
						name2 = value.userName2
					}
				})

			   await this.matchApi.createMatch({
						idP1: finded.handshake.query.idIntra,
						idP2: query.idIntra,
						idGame: finded.id,
					})

				this.server.to(finded.id).emit('start-game', {
					idGame : finded.id,
					idP1 : finded.id,
					idP2 : client.id,
					name1: name1,
					name2: name2,
					matchType: query.matchType,
					seed: Math.floor(Math.random() * 1000000)
				});
				this.notifyService.exec("deleteGameNotification", {
					idP1 : finded.handshake.query.idIntra,
					idP2 : query.idIntra,
				})
			}
		}
	}

	async handleDisconnect(client: Socket): Promise<any> {
		QUEUE.forEach((value, key) => {
			if (value.player1 === client.id || value.player2 === client.id)
				this.server.to(value.player1).emit("disconnect-player", {player: value.player1 === client.id ? 1 : 2});
		})
		pvtQUEUE.forEach((value, key) => {
			if (value.player1 === client.id || value.player2 === client.id) {
				this.server.to(value.player1).emit("disconnect-player", {player: value.player1 === client.id ? 1 : 2})
				if (value.player1 === client.id)
				this.notifyService.exec("deleteGameNotification", {
					idP1 : value.idIntra1,
					idP2 : value.idIntra2,
				})
			}
		})
        let session : ISession = await this.sessionService.findSession(client.handshake.query.idIntra)
        await this.sessionService.saveSession(client.handshake.query.idIntra, {
            status : "online",
            socketId : session.socketId
        })
		this.notifyService.exec("online", client.handshake.query.idIntra)
		QUEUE.delete(client)
		pvtQUEUE.delete(client)
	}



	// EVENTI

	@SubscribeMessage('keypressed')
	handleKeypress(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('keypressed', payload)
	}

	@SubscribeMessage('hit')
	handleHit(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('hit', payload)
	}

	@SubscribeMessage('ball')
	handleBall(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('ball', payload)
	}

	@SubscribeMessage('goal')
	handleGoal(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('goal', payload)
	}

	@SubscribeMessage('request-game-update')
	handleRequest_game_update(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('request-game-update', payload)
	}

	@SubscribeMessage('game-update')
	handleGame_update(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('game-update', payload)
	}

	@SubscribeMessage('finish')
	handleFinish(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('finish', payload)
	}

	@SubscribeMessage('disconnect-player')
	handleDisconnectPlayer(client: any, payload: any): void {
		this.server.to(payload.idGame).emit('disconnect-player', {})
	}

	@SubscribeMessage('update-game-finish')
	handleUpdateDB(client: any, payload: any): void {
		this.matchApi.updateMatch({
			idGame: payload.idGame,
			scoreP1: payload.score_p1,
			scoreP2: payload.score_p2,
		})
			.catch((e : any) => ErrorDispatcher(e))
	}
}
