import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import {IChat, IJoinPublicChat, IUser} from "../../types/Types";
import * as bcrypt from 'bcrypt';
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {ClientProxy} from "@nestjs/microservices";

@Injectable()
export class ChatService {
    constructor(
		@Inject('NOTIFY_SERVICE') private client: ClientProxy,
        private readonly prisma: PrismaService,
    ) {
        this.prisma = new PrismaService({rejectOnNotFound: true,})
    }

	async createChat(chat : any) : Promise<any> {
    	try {
		    let retChat: any;
		    if (chat.pwd) {
			    const saltOrRounds = 10;
			    const hash = await bcrypt.hash(chat.pwd, saltOrRounds);
			    retChat = await this.prisma.chat.create({
				    data: {
					    idIntra: chat.idIntra,
					    name: chat.name,
					    types: chat.types,
					    pwd: hash,
					    participant: {
						    create: [
							    {
								    idIntra: chat.idIntra,
							    }
						    ]
					    },
					    admin: {
						    create: [
							    {
								    idIntra: chat.idIntra,
							    }
						    ]
					    },
				    },
				    include: {
					    participant: true,
					    admin: true
				    }
			    })
		    }
		    else {
			    retChat = await this.prisma.chat.create({
				    data: {
					    idIntra: chat.idIntra,
					    name: chat.name,
					    types: chat.types,
					    participant: {
						    create: [
							    {
								    idIntra: chat.idIntra,
							    }
						    ]
					    },
					    admin: {
						    create: [
							    {
								    idIntra: chat.idIntra,
							    }
						    ]
					    },
				    },
				    include: {
					    participant: true,
					    admin: true
				    }
			    })
		    }
		    return retChat;
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async addParticipant(participant : any) : Promise<void> {
    	try {
		    let retParticipant = await this.prisma.user.findUnique({
			    where: {
				    idIntra: participant.idIntra
			    }
		    })
		    let chat = await this.prisma.chat.findUnique({
			    where : {
			    	id : participant.idChat
			    }
		    })
		    if (chat.banned.find((ban : string) => ban === participant.idIntra))
		    	throw new HttpException("User banned", HttpStatus.FORBIDDEN)
		    let newpa :any = await this.prisma.participant.create({
			    data: {
				    idIntra: participant.idIntra,
				    idChat: participant.idChat
			    }
		    })
	    } catch(e : any) {
    	    console.log('errore add participant');
		    ErrorDispatcher(e)
	    }
	}

	async removeParticipant(participant : any) : Promise<void> {
    	try {
    		let chat = await this.prisma.chat.findUnique({
				where : {
					id : participant.idChat
				}
			})
			if (chat.types === "private-duo") {
				this.client.emit("rmv_chat", participant.idChat)
				return ;
			}
		    await this.prisma.participant.delete({
			    where: {
			    	idIntra_idChat : {idIntra : participant.idIntra, idChat : participant.idChat}
			    }
		    })
			this.client.emit('remove_participant', participant);
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async leaveChat(me :any) : Promise<void> {
    	try {
			await this.prisma.participant.deleteMany({
				where: {
					idIntra: me.idIntra,
					idChat : me.idChat
				}
			})
		} catch (e :any) {
    		ErrorDispatcher(e)
		}
	}

	async addAdmin(admin : any) : Promise<void> {
    	try {
		    await this.prisma.admin.create({
			    data: {
				    idIntra: admin.idIntra,
				    idChat: admin.idChat
			    }
		    })
			this.client.emit('new_admin', admin);
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async removeAdmin(admin : any) : Promise<void> {
    	try {
		    await this.prisma.admin.deleteMany({
			    where: {
				    idIntra: admin.idIntra,
				    idChat: admin.idChat
			    }
		    })
			this.client.emit('rmv_admin', admin);
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async addMod(moderator : any) : Promise<void> {
		try {
			await this.prisma.moderator.create({
				data: {
					idIntra: moderator.idIntra,
					idChat: moderator.idChat
				}
			})
			this.client.emit('new_moderator', moderator);
		} catch(e : any) {
			ErrorDispatcher(e)
		}
	}

	async removeMod(moderator : any) : Promise<void> {
		try {
			await this.prisma.moderator.deleteMany({
				where: {
					idIntra: moderator.idIntra,
					idChat: moderator.idChat
				}
			})
			this.client.emit('rmv_moderator', moderator);
		} catch(e : any) {
			ErrorDispatcher(e)
		}
	}

	async banUser(banReq : { idIntra : string, idChat : number }) : Promise<void> {
		try {
			let chat = await this.prisma.chat.findUnique({
				where : {
					id : banReq.idChat
				}
			})
			chat.banned.push(banReq.idIntra)
			await this.prisma.chat.update({
				where: {
					id : banReq.idChat
				},
				data : {
					banned : chat.banned
				}
			})
			this.client.emit('ban_participant', banReq);
			await this.removeParticipant(banReq)
		} catch(e : any) {
			console.log("Error, ", e)
			ErrorDispatcher(e)
		}
	}

	async showAdmin(idChat : string) : Promise<any> {
    	try {
		    let num = parseInt(idChat)
		    const ret = await this.prisma.admin.findMany({
			    where: {
				    idChat: num
			    },
		    })
		    return ret;
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async showParticipant(idChat : string) : Promise<any> {
		let num = parseInt(idChat)
		try {
			const ret = await this.prisma.participant.findMany({
				where : {
					idChat  : num
				},
			})
			let users = await Promise.all(ret.map(async (partecipant) => {
				let user = await this.prisma.user.findUnique({
					where : {
						idIntra : partecipant.idIntra
					},
					select : {
						id : true,
						userName : true,
						idIntra : true
					}
				});
				if (user)
					return user;
			}));
			return users;
		} catch(e : any) {
			ErrorDispatcher(e)
		}
	}

	async showChatPerUser(idIntra : string) : Promise<any> {
    	try {
		    const ret: any = await this.prisma.participant.findMany({
			    where: {
				    idIntra: idIntra
			    },

			    include: {
				    chat: true
			    }
		    })
		    let vret = await Promise.all(ret.map(async (part: any) => {
			    let partecipant = await this.prisma.participant.findMany({
				    where: {
					    idChat: part.chat.id
				    },
				    include : {
				    	user : true
				    }
			    });
			    part.participant = partecipant;
			    return part;
		    }));
		    return vret;
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async showChat(idChat : number) : Promise<IChat> {
    	try {
		    const chat : any = await this.prisma.chat.findUnique({
			    where: {
				    id: idChat
			    },
			    include: {
			    	moderators: true,
				    admin: true,
				    participant: true
			    }

		    })
		    chat.participant = await Promise.all(chat.participant.map(async (participant: any) => {
		    	let user = await this.prisma.user.findUnique({
				    where : {
				    	idIntra : participant.idIntra,
				    },
				    select : {
				    	id : true,
				    	idIntra : true,
					    img : true,
					    userName : true
				    }
			    })
			    return user;
		    }))
		    return chat;
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async showChats() : Promise<any> {
    	try {
		    const ret : any = await this.prisma.chat.findMany({
			    include: {
                    admin       :true,
                    moderators  :true,
                    participant :true,
                }

		    });
		    return ret;
	    } catch(e : any) {
		    ErrorDispatcher(e)
	    }
	}

	async showPublic() : Promise<any> {
        try {
            const ret : any = await this.prisma.chat.findMany({
                where: {
                    types : 'public'
                },
                include: {
                    admin       :true,
                    moderators  :true,
                    participant :true,
                }
            });
            return ret;
        } catch (e :any) {
            ErrorDispatcher(e)
        }
    }

    async showPublicUserNotIn(idIntra : string) : Promise<any> {
    	try {
    		let chats : any = await this.prisma.chat.findMany({
				where : {
					types : "public",
					participant: {
						none : {
							idIntra : idIntra
						}
					},
					//NOT : {
					// 	banned: {
					// 		has : idIntra
					// 	}
					//}
				},
				select : {
					id : true,
					idIntra : true,
					types : true,
					name : true,
					pwd : true,
					banned: true,
					participant : false,
					admin : false,
					moderators : false,
				}
			})
			chats = chats.filter((chat) => !chat.banned.length || chat.banned.find((ban)=>ban === idIntra) === undefined)
		    return chats.map((chat : any) => {
		    	if (chat.pwd != null)
		    		chat.pwd = true;
		    	delete chat.banned
		    	return chat;
		    })
		} catch (e) {
			console.log("Error on show public chat where user not in", e)
			ErrorDispatcher(e);
		}
	}

	async canUserDeleteChat(idIntra : string, idChat : number) : Promise<boolean> {
		try {
			if (["cromalde", "ade-feli", "dmalori", "aduregon", "sgiovo", "mcossu", "usavoia", "forsili"].find((id)=>id === idIntra)!= undefined)
				return true ;
			let res = await this.prisma.chat.findMany({
				where : {
					id : idChat,
					OR : [
						{
							admin: {
								some: {
									idIntra: idIntra
								}
							}
						},
						{
							idIntra : idIntra
						}
					]
				},
			})
			return res.length > 0;

		} catch (e) {
			return false;
		}
	}

    async showPrivate() : Promise<any> {
        try {
            const ret : any = await this.prisma.chat.findMany({
                where: {
                    types : 'private'
                },
                include: {
                    admin       :true,
                    moderators  :true,
                    participant :true,
                }
            });
            return ret;
        } catch (e :any) {
            ErrorDispatcher(e)
        }
    }

	async deleteChat(idChat: number) : Promise<any> {
    	try {
    		await this.prisma.admin.deleteMany( {
				where: {
					idChat: idChat
				}
			})
		    await this.prisma.moderator.deleteMany( {
			    where: {
				    idChat: idChat
			    }
		    })
            await this.prisma.participant.deleteMany( {
                where: {
                    idChat: idChat
                }
            })
            await this.prisma.chat.delete( {
                where:{
                    id: idChat
                }
            })
		} catch (e :any) {
			ErrorDispatcher(e);
        }
	}

    async emptyChat() : Promise<any> {
        try {
            await this.prisma.admin.deleteMany()
            await this.prisma.participant.deleteMany()
            await this.prisma.chat.deleteMany()
        } catch (e :any) {
            ErrorDispatcher(e);
        }
    }

    async checkJoinChat(payload : IJoinPublicChat) : Promise<boolean> {
    	try {
		    let chat = await this.prisma.chat.findMany({
			    where: {
				    id: payload.idChat,
				    participant: {
					    none: {
						    idIntra: payload.idIntra
					    }
				    }
			    },

		    })
		    if (!chat.length)
		    	return false;
		    if (chat[0].hasOwnProperty('pwd')) {
		    	if (chat[0].pwd == null)
		    		return true;
		    	if (!payload.hasOwnProperty('pwd'))
		    		return false;
			    const isMatch : boolean = await bcrypt.compare(payload.pwd, chat[0].pwd);
			    if (isMatch)
			    	return true;
		    }
		    return false;
	    } catch (e) {
		    return false;
	    }
    }

    async updateChatPwd(payload : {idChat : number, pwd : string}) : Promise<void> {
    	try {
		    const saltOrRounds = 10;
		    const hash = await bcrypt.hash(payload.pwd, saltOrRounds);
    		await this.prisma.chat.update({
			    where : {
			    	id : payload.idChat
			    },
			    data : {
			    	pwd : hash
			    }
		    })
	    } catch (e) {
		    ErrorDispatcher(e);
	    }
    }

    async muteParticipant(payload : {idChat : number, idIntra : string}) : Promise<void> {
    	try {
    		await this.prisma.participant.update({
			    where : {
			    	idIntra_idChat : payload
			    },
			    data : {
			    	muted : true
			    }
		    })
	    } catch (e) {
		    ErrorDispatcher(e);
	    }
    }

	async unmuteParticipant(payload : {idChat : number, idIntra : string}) : Promise<void> {
		try {
			await this.prisma.participant.update({
				where : {
					idIntra_idChat : payload
				},
				data : {
					muted : false
				}
			})
		} catch (e) {
			ErrorDispatcher(e);
		}
	}
}
