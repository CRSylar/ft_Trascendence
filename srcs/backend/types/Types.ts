

export interface ISession {
	status          : "in-game" | "online" | "offline",
	socketId        : string,
}

export interface IMessage {
	timestamp       : number;
	sender          : string;
	idChat          : string;
	userName        : string;
	msgBody         : string;
}

export interface IAchievement {
	id              : number,
	idIntra         : string,
	wone            : boolean,
	wten            : boolean,
	whun            : boolean
}

export interface IUserPublic {
	id              : number,
	email           : string,
	tel             : string
	img             : string,
	firstName       : string,
	lastName        : string,
	userName        : string,
	idIntra         : string,
	campus          : string,
	win             : number,
	loses           : number,
	rank            : number
}

export interface IUser {
	id             : number,
	email          : string,
	tel            : string
	img            : string,
	firstName      : string,
	lastName       : string,
	userName       : string,
	idIntra        : string,
	campus         : string,
	twoFa?         : boolean,
	otpSecret?     : string,
	otpUrl?        : string,
	win            : number,
	loses          : number,
	rank           : number,
	badge          : any,
	chat           : any,
	admin          : any,
	participant    : any,
	userFriends    : any,
	blocked        : any,
	blockedBy      : any,
	moderators     : any,
	status?        : string
}

export interface IBasicUserInfo {
	id          : number,
	idIntra     : string,
	img         : string,
	userName    : string
}

export interface IParticipant {
	idIntra : string,
	idChat  : number
}

export interface IAdmin {
	idIntra : string,
	idChat  : number
}

export interface IChat {
	id              : number,
	name            : string,
	types           : string,
	readUntil?      : number,
	msg             : IMessage[],
	admin           : IAdmin[],
	participant     : IParticipant[]
}

export interface IGame {
	id          : number,
	idP1        : string,
	idP2        : string,
	idGame      : string,
	status      : boolean
	scoreP1     : number,
	scoreP2     : number
}

enum eMatch {
	classic,
	sd,
	mc,
	full,
}

export interface IJoinPublicChat {
    idIntra : string,
    idChat : number,
    pwd?: string
}

export interface IMatch {
	user            : string, // Nome utente visualizzato
	idIntra         : string,
	matchType       : eMatch,
	pvt             : boolean,
	friend?         : string,
	idIntraFriend?  : string, // id Intra dell'amico da invitare
	spectator?      : string,
}

export interface IFollower {
	friendId        : string,         // followed
	userId          : string,        // follower
	img             : string,       // followerImg
	userName        : string       // followerName
}

export interface IMessageNotify {
	idChat          : number,
	idSender        : string,
	userName        : string,
	timestamp       : number
}

export type Tcontent = IMatch | IFollower;

export enum TNotify {
	followed,
	message,
	game_req
}

export class CNotifyFollowed implements INotify {
	public type         : TNotify;
	public content      : IFollower;
	public timestamp    : number;
	public id			: string;

	constructor(content : IFollower) {
		this.type = TNotify.followed;
		this.content = content;
		this.timestamp = Date.now()
		this.id = `${this.content.friendId}${this.type}${this.content.userId}`
	}
}

export class CNotifyMessage implements INotify {
	public type         : TNotify;
	public content      : IMessageNotify;
	public timestamp    : number;
	public id			: string;

	constructor(content : IMessageNotify) {
		this.type = TNotify.message;
		this.content = content;
		this.timestamp = Date.now()
		this.id = `${this.type}${this.content.idChat}${this.content.timestamp}`
	}
}

export class CNotifyGame implements INotify {
	public type         : TNotify;
	public content      : IMatch;
	public timestamp    : number;
	public id			: string;

	constructor(content : IMatch) {
		this.type = TNotify.game_req;
		this.content = content;
		this.timestamp = Date.now()
		this.id = `${this.content.idIntra}${this.type}${this.content.idIntraFriend}`
	}
}

export interface INotify {
	type        : TNotify,
	content     : any,
	timestamp   : number,
	id			: string,
}


/*
*
* EVENTS EMITTED BY WEBSOCKET(SERVER)
**************************************
* loadNotifications ==>
**************************************
*
* PAYLOAD STRUCTURE
* {
*   followed : CNotifyFollowed[],
*   message : {
*       idChat0 : CNotifyMessage[];
*       idChat1 : CNotifyMessage[];
*       idChat2 : CNotifyMessage[];
*       ...
*       idChatN : CNotifyMessage[];
*   }
* }
*
*
**************************************
* loadChat ==>
**************************************
*
* PAYLOAD STRUCTURE
* Array[] => {
*   id 				: number;
*	name 			: string;
*	types 			: 		string;
*	msg 			: IMessage[];
*	admin 			: IAdmin[];
*	participant 	: IParticipant[];
* }
*
*
**************************************
* userChanged ==>
**************************************
*
* PAYLOAD STRUCTURE
* [IUserPublic]
* {
*   id 			: number;
*   email 		: string;
*   tel 		: string;
*   img			: string;
*   firstName	: string;
*   lastName	: string;
*   userName	: string;
*   idIntra		: string;
*   campus		: string;
*   win			: number;
*   loses		: number;
*   rank		: number;
* }
*
*
**************************************
* userUpdate ==>
**************************************
*
* PAYLOAD STRUCTURE
* [IUser] Without twofa secrets
* {
*   id             : number;
*	email          : string;
*	tel            : string
*	img            : string;
*	firstName      : string;
*	lastName       : string;
*	userName       : string;
*	idIntra        : string;
*	campus         : string;
*	win            : number;
*	loses          : number;
*	rank           : number;
*	badge          : any;
*	chat           : any;
*	admin          : any;
*	participant    : any;
*	userFriends    : IUser[];
*	blocked        : any[];
*	blockedBy      : any[];
*	moderators     : any[];
*	status?        : string;
* }
*
*
**************************************
* addedAsFriend ==>
**************************************
*
* PAYLOAD STRUCTURE
* [CNotifyFollowed]
* {
* 	type         : TNotify.followed;
*	content      : IFollower;
*	timestamp    : number;
* }
*
*
**************************************
* gameReq ==>
**************************************
*
* PAYLOAD STRUCTURE
* [CNotifyGame]
* {
* 	type         : TNotify.game_req;
*	content      : IMatch;
*	timestamp    : number;
* }
*
*
**************************************
* gameReqFail ==>
**************************************
*
* PAYLOAD STRUCTURE
* [CNotifyGame]
* {
* 	type         : TNotify.game_req;
*	content      : IMatch;
*	timestamp    : number;
* }
*
*
**************************************
* deleteGameNotification ==>
**************************************
*
* PAYLOAD STRUCTURE
* {
* 	idIntra         : string;
*	idIntraFriend   : string;
* }
*
**************************************
* msgToClient ==>
**************************************
*
* PAYLOAD STRUCTURE
* {
* 	to 		: string; // websocket room usually idChat
* 	content : IMessage;
* }
*
**************************************
* isTyping ==>
**************************************
*
* PAYLOAD STRUCTURE
* {
* 	to 		: string;  // websocket room usually idChat
*	msg 	: boolean; // true if is typing false otherwise
* 	user 	: string;
* }
*
**************************************
* joinChatRequest ==>
**************************************
*
* PAYLOAD STRUCTURE
* {
*   idChat : number;
* }
*
**************************************
* joinSuccess ==>
**************************************
*
* PAYLOAD STRUCTURE
* [IChat] ==> participant become type [IBasicUserInfo[]]
* {
*   participant : IBasicUserInfo[]
* }
*
**************************************
* chatRemoved ==>
**************************************
*
* PAYLOAD STRUCTURE
* {
*   idChat : number
* }
*
*
**************************************
* messageNotification ==>
**************************************
*
* PAYLOAD STRUCTURE
* [CNotifyMessage]
* {
* 	type         : TNotify.message;
*	content      : IMessageNotify;
*	timestamp    : number;
* }
*
*
**************************************
* removeFollowed ==>
**************************************
*
* PAYLOAD STRUCTURE
* [CNotifyFollowed]
* {
* 	type         : TNotify.followed;
*	content      : IFollowedNotify;
*	timestamp    : number;
* }
*
*
* */