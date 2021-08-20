
// import { useContext } from "react"
// import { UserContext } from "../../App";
//**************************************************************//
//					HOW TO USE APICONNECTOR:					//
//import * as api form "./path"									//
//																//
// => api.function()											//
//**************************************************************//

//*******************************************//
//Get logged user data with api              //
//*******************************************//
export async function GetAuth() {
	let res : any = await fetch("/api/users/me", {
		method: 'GET'
	}).catch((e) => {
		console.error(e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	return res.json().then((out : any) => {
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}

// const LoginSetUser = () => {
// 	let context : any = useContext(UserContext);
// 	console.log('context in auth',context);
	
// }

//**********************************************//
//Login User									//
//**********************************************//

export function GetLogin() {
	window.location.replace('/api/auth')
}

//**********************************************//
//Logout User									//
//**********************************************//
export async function GetLogout() {
	fetch("/api/auth/logout", {
		method: 'GET'
	}).then(()=>{
		window.location.reload();
	}).catch((e) => {
		console.error(e.msg);
	})
}

//**********************************************//
//Get Data of user by path location				//
//**********************************************//
export async function GetUserByLocation(location : string) {
	let name : string 
	name= location.substr(9);
	let res : any = await fetch("/api/users/profile/" + name, {
		method: 'GET'
	}).catch((e) => {
		console.error(e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	return res.json().then((out : any) => {
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}

//**********************************************//
//Get Data of user by name						//
//**********************************************//
export async function GetUserByName(name : string) {
	let res : any = await fetch("/api/users/profile/" + name, {
		method: 'GET'
	}).catch((e) => {
		console.error(e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	return res.json().then((out : any) => {
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}

//**********************************************//
//Get Stats of user by name						//
//**********************************************//
export async function GetStatsByName(name : string) {
	let res : any = await fetch("/api/users/stats?idIntra=" + name, {
		method: 'GET'
	}).catch((e) => {
		console.error(e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	return res.json().then((out : any) => {
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}

//**********************************************//
//Get All Registered user						//
//**********************************************//
export async function GetAllUser() {
	let res : any = await fetch("/api/users/all", {
		method: 'GET'
	}).catch((e) => {
		console.error(e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	return res.json().then((out : any) => {
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}

//**********************************************//
//Create a firendship between two users			//
//**********************************************//
export async function PostFriendshipRequest(InputFriendId : string) {
	GetAuth().then((user) => {
		if (user != null)
		{
		    if (user.idIntra === InputFriendId )
		        return console.error('non puoi aggiungere te stesso agli amici');
			let InputUserId : any = user.idIntra;
			fetch("/api/friends/add", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId : InputUserId,
					friendId: InputFriendId,
				})
			}).catch((e) => {
				console.error(e.msg);
			});
		}
		else
		{
			console.error('something goes wrong during firendship request');
			return null;
		}
	})
}

//**********************************************//
//Remove a firendship between two users			//
//**********************************************//
export async function PostUnFriendshipRequest(InputFriendId : string) {
    GetAuth().then((user) => {
        if (user != null)
        {
            if (user.idIntra === InputFriendId )
                return console.error('non puoi rimuovere te stesso agli amici');
            let InputUserId : any = user.idIntra;
            fetch("/api/friends/remove", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId : InputUserId,
                    friendId: InputFriendId,
                })
            }).catch((e) => {
                console.error(e.msg);
            });
        }
        else
        {
            console.error('something goes wrong during Unfirendship request');
            return null;
        }
    })
}



//**********************************************//
//		Create a chat							//
//**********************************************//
// name = nomeChat ; participants = array di utenti partecipanti(idIntra) ; idIntraCreator=idcliccatore ; type(pubblic|private|password)
export async function NewChat(client : any, name : string, otherParticipants : any[], idIntraCreator : string, types : string, pwd?: string) {
	let chat : {
		chat : {
			idIntra : string,
			name : string,
			types : string,
			pwd? : string
		},
		partecipants : any[],
	} = {
		chat : {
			idIntra : idIntraCreator,
			name : name,
			types : types,
		},
		partecipants : otherParticipants,
	}
	if (types === 'public' && pwd)
		chat.chat.pwd = pwd;
	client.emit('createChatRequest', chat)
}

//**********************************************//
//	Get all chat per User						//
//**********************************************//
export async function GetChatPerUser(idIntra : string) {
	let res : any = await fetch(`/api/chat/show/${idIntra}`, {
		method: 'GET'
	}).catch((e) => {
		console.error(e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	return res.json().then((out : any) => {
		//console.log("chats ==> ",out);
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}

//**********************************************//
//		Get message from chat					//
//**********************************************//
export async function GetMessagesPerChat(idChat : number) {
	let res : any = await fetch(`/api/messages/${String(idChat)}`, {
		method: 'GET'
	}).catch((e) => {
		console.error("error", e.msg);
	});
	if (res.status !== 200)
	{
		console.error('Error ', res.status)
		return null;
	}
	//console.log('risposta =>> ', res);
	return res.json().then((out : any) => {
		return out;
	}).catch((e : any) => {
		console.error('Bad data format',e);
		return null;
	})
}
//**********************************************//
//		Mute / UnMute one User	Globally		//
//**********************************************//
export async function blockUser(myIdIntra : String, blockedIdIntra: String) {
    await fetch('/api/blacklist/add', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            myIdIntra : myIdIntra,
            blockedIdIntra: blockedIdIntra,
        })
    })
}

export async function unBlockUser(myIdIntra : String, blockedIdIntra: String) {
    await fetch('/api/blacklist/remove', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            myIdIntra : myIdIntra,
            blockedIdIntra: blockedIdIntra,
        })
    })
}

//**********************************************//
//		Delete Follow Nofification				//
//**********************************************//
export async function deleteFollowNotification(notification : any) {
	try {
		await fetch(`/api/notify/follower/${notification.id}`, {
			method: "DELETE"
		})
	} catch (e) {
		console.error("delete follow notification error", e)
	}
}
//**********************************************//
//		Remove Participant from chat			//
//**********************************************//
export async function removeParticipant(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/removeparticipant', {
			method: "DELETE",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Remove Participant Error", e)
	}
}
//**********************************************//
//		Ban Participant from chat				//
//**********************************************//
export async function banParticipant(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/banUser', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Remove Participant Error", e)
	}
}

//**********************************************//
//		Aggiunge Moderatore alla chat			//
//**********************************************//
export async function addModerator(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/addmod', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Add Moderator Error", e)
	}
}

export async function removeModerator(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/removemod', {
			method: "DELETE",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Remove Moderator Error", e)
	}
}

//**********************************************//
//		Aggiunge Admin alla chat	    		//
//**********************************************//

export async function addAdmin(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/addadmin', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Add Admin Error", e)
	}
}

export async function removeAdmin(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/removeadmin', {
			method: "DELETE",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Remove Admin Error", e)
	}
}


//**********************************************//
//		 Mutare/Smutare utente della chat		//
//**********************************************//
export async function muteParticipant(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/muteParticipant', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Remove Participant Error", e)
	}
}

export async function unMuteParticipant(value : {idParticipant : string, idChat: number}) : Promise<any>{
	try {
		return await fetch('/api/chat/unmuteParticipant', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idIntra : value.idParticipant,
				idChat : value.idChat
			})
		})
	} catch (e :any) {
		console.error("Remove Participant Error", e)
	}
}
//**********************************************//
//		 Update Password della chat				//
//**********************************************//
export async function changePwd(value : {idChat: number, newPwd: string}) : Promise<any>{
	try {
		return await fetch('/api/chat/updatePwd', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idChat : value.idChat,
				pwd : value.newPwd
			})
		})
	} catch (e :any) {
		console.error("Remove Participant Error", e)
	}
}

//**********************************************//
//					Find Users					//
//**********************************************//
export async function findUsers(query : string) : Promise<any>{
	try {
		let users = await fetch(`/api/users/findUserByName/${query}`, {
			method: "GET",
		})
		users = await users.json()
		return users;
	} catch (e :any) {
		console.error("Remove Participant Error", e)
	}
}

//**********************************************//
//					GEt Messages per Chat		//
//**********************************************//
export async function getMessages(idChat : string) : Promise<any> {
	try {
		const msg = await fetch('/api/messages/chat', {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body : JSON.stringify({
				idChat : idChat,
			})
		})
		return await msg.json();
	} catch (e :any) {
		console.error("get Messages per chat error", e);
	}
}