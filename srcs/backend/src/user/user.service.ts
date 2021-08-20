import {
    CACHE_MANAGER,
    HttpException,
    HttpStatus,
    Inject,
    Injectable, Query,
} from '@nestjs/common';

import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { Cache } from "cache-manager";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {ClientProxy} from "@nestjs/microservices";
import {MySessionService} from "../my-session/my-session.service";
import {ISession, IUser} from "../../types/Types";

@Injectable()
export class UserService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('NOTIFY_SERVICE') private client: ClientProxy,
        private auth : AuthService,
        private readonly prisma: PrismaService,
        private sessionService : MySessionService,
    ) {this.prisma = new PrismaService({rejectOnNotFound: true,}) }

    async showProfile(query : string) : Promise<any> {
        try {
            const user : IUser = await this.prisma.user.findUnique({
                where: {
                    idIntra: query
                },
                include: {
                    badge          : true,
                    chat           : true,
                    admin          : true,
                    participant    : true,
                    userFriends    : true,
                    blocked        : true,
                    blockedBy      : true,
                    moderators     : true,
                }
            })
            let state : ISession = await this.sessionService.findSession(user.idIntra);
            if (state == null)
                state = { socketId: "", status: "offline" };
            user.status = state.status;
            delete user.otpSecret;
            delete user.otpUrl;
            let blocked = Object();
            user.blocked.forEach((block) => blocked[block.blockedId] = true)
            user.blocked = blocked;
            user.userFriends = await Promise.all(user.userFriends.map( async (friend) => {
                let friendEntry : any = await this.prisma.user.findUnique({
                    where: {
                        idIntra: friend.friendId
                    },
                    select: {
                        email          :true,
                        tel            :true,
                        img            :true,
                        firstName      :true,
                        lastName       :true,
                        userName       :true,
                        idIntra        :true,
                        campus         :true,
                        win            :true,
                        loses          :true,
                        rank           :true,
                        badge          :true,
                    }
                });
                friendEntry.status = await this.sessionService.findSession(friendEntry.idIntra);
                if (friendEntry.hasOwnProperty('status') && friendEntry.status !== null)
                    friendEntry.status = friendEntry.status.status;
                return friendEntry;
            }));
            return user;
        } catch (e) {
            console.log("error",e);
            ErrorDispatcher(e)
        }
    }

    deleteSecrets(user : any) : any {
        delete user.twoFa;
        delete user.banned;
        delete user.otpSecret;
        delete user.otpUrl;
        return user;
    }

    async showStats(query : string) : Promise<any> {
        try {
            let ret :any = await this.prisma.user.findUnique({
                where: {
                    idIntra: query
                },
                include: {
                    badge          : true,
                }
            });
            ret = this.deleteSecrets(ret);
            let state : ISession = await this.sessionService.findSession(ret.idIntra);
            if (state == null)
                state = { socketId: "", status: "offline" };
            ret.status = state.status;
            return ret;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async showUsers() : Promise<any> {
        try {
            let ret = await this.prisma.user.findMany({
                include: {
                    badge          : true,
                }
            });
            ret = ret.map((user) => this.deleteSecrets(user))
            return ret;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async activate2fa(id: number) : Promise<HttpStatus> {
        try {
            await this.prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    twoFa: true
                },
            });
            await this.auth.starttwofactor(id);
            return HttpStatus.ACCEPTED
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async deactivate2fa(idIntra: string) : Promise<any> {
        try {
            let user = await this.prisma.user.update({
                where: {
                    idIntra: idIntra
                },
                data: {
                    twoFa: false,
                    otpSecret: "",
                    otpUrl: ""
                },
            });
            return user;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async changeShowedName(body) : Promise<any> {
        try {
            let user = await this.prisma.user.update({
                where: {
                    idIntra: body.idIntra
                },
                data: {
                    userName: body.userName
                },
                include: {
                    badge          : true,
                }
            });
            user = this.deleteSecrets(user);
            this.client.emit('public_update', user);
            return user;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async changeAvatar(body) : Promise<any> {
        try {
            let user = await this.prisma.user.update({
                where: {
                    idIntra: body.idIntra
                },
                data: {
                    img: body.img
                },
                include: {
                    badge          : true,
                }
            });
            user = this.deleteSecrets(user)
            this.client.emit('public_update', user);
            return user;
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    async changePhone(body): Promise<any> {
        try {
            let user = await this.prisma.user.update( {
                where: {
                    idIntra : body.idIntra
                },
                data : {
                    tel : body.tel
                },
                include: {
                    badge          : true,
                }
            });
            user = this.deleteSecrets(user)
            this.client.emit('public_update', user);
            return user;
        } catch (e) {
            ErrorDispatcher(e);
        }
    }

    async changeMail(body): Promise<any> {
        try {
            let user = await this.prisma.user.update( {
                where: {
                    idIntra : body.idIntra
                },
                data : {
                    email : body.email
                },
                include: {
                    badge          : true,
                }
            });
            user = this.deleteSecrets(user)
            this.client.emit('public_update', user);
            return user;
        } catch (e) {
            ErrorDispatcher(e);
        }
    }

    async banUser(body) : Promise<any> {
        try {
            let owner : any = await this.prisma.user.findUnique({
                where:{
                    idIntra: body.idIntra
                }
            });
            if (owner.owner)
                throw new HttpException("Not Authorized", HttpStatus.UNAUTHORIZED);
            let user = await this.prisma.user.update({
                where: {
                    idIntra : body.idIntra
                },
                data: {
                    banned: true
                }
            });
            this.client.emit('banned', user);
        }catch (e) {
            ErrorDispatcher(e);
        }
    }

    async unBanUser(body) : Promise<any> {
        try {
            await this.prisma.user.update({
                where: {
                    idIntra : body.idIntra
                },
                data: {
                    banned: false
                }
            });
        }catch (e) {
            ErrorDispatcher(e);
        }
    }

    async addUserSiteAdmin(payload : {idIntra : string}) : Promise<void> {
        try {
            await this.prisma.user.update({
                where : {
                    idIntra : payload.idIntra
                },
                data : {
                    isAdmin : true
                }
            })
        } catch (e) {
            console.log("error add admin", e)
            ErrorDispatcher(e)
        }
    }

    async removeUserSiteAdmin(payload : {idIntra : string}) : Promise<void> {
        try {
            await this.prisma.user.update({
                where : {
                    idIntra : payload.idIntra
                },
                data : {
                    isAdmin : false
                }
            })
        } catch (e) {
            ErrorDispatcher(e)
        }
    }

    computeNameString(name : string) : {userName : { contains? : string, startsWith? : string, mode : "insensitive" }}[] {
        let charFounded = Object();
        let res : {userName : { contains? : string ,startsWith? : string , mode : "insensitive"}}[] = [];
        let entry : {userName : { contains : string , mode : "insensitive"}};
        res.push({userName : { startsWith : name.charAt(0), mode : "insensitive" }})
        for (let c of name) {
            if (!charFounded.hasOwnProperty(c)) {
                entry = {userName : { contains : c, mode : "insensitive" }}
                res.push(entry)
            }
            charFounded[c] = true;
        }
        return res;
    }

    computeFindResult(results : {idIntra:string, userName : string, img : string}[], query : string) {
        let res : {idIntra:string, userName : string, img : string}[] = [];
        let i : number = 0;
        let tollerance : number = 2;
        let notFound : number = 0;
        let tmpStr : string;
        results.forEach((result : {idIntra:string, userName : string, img : string}) => {
            tmpStr = result.userName;
            if (tmpStr.length < query.length)
                return ;
            i = 0;
            notFound = 0;
            for (let char of tmpStr) {
                if (char == query.charAt(i)) {
                    i++;
                    if (i == query.length) {
                        res.push(result)
                        return ;
                    }
                    notFound = 0;
                } else {
                    notFound++;
                    if (notFound >= tollerance)
                        return ;
                }
            }
        })
        return res;
    }

    async findUserByName(name : string) : Promise<{idIntra:string, userName : string, img : string}[]> {
        try {
            const query = this.computeNameString(name);
            let users = await this.prisma.user.findMany({
                where : {
                    AND : query,
                },
                select : {
                    idIntra : true,
                    userName : true,
                    img : true
                }
            })
            return this.computeFindResult(users, name);
        } catch (e) {
            return [];
        }
    }
}
