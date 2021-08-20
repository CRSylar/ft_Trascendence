import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import {UserService} from "../user/user.service";
import {Cache} from "cache-manager";
import {ClientProxy} from "@nestjs/microservices";

@Injectable()
export class BlacklistService {
	constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('NOTIFY_SERVICE') private client: ClientProxy,
	    private userService : UserService,
	    private readonly prisma: PrismaService) { }

	async addBlock(block : any) : Promise<void> {
		try {
			await this.prisma.blacklist.create({
				data : {
					blockId : block.myIdIntra,
					blockedId : block.blockedIdIntra
				}
			})
			this.client.emit('blockUser', block.myIdIntra)
		} catch (e : any) { ErrorDispatcher(e) }
	}

	async removeBlock(sblock :any) : Promise<void>{
	    try {
	    	await this.prisma.blacklist.deleteMany({
				where: {
					blockId: sblock.myIdIntra,
					blockedId: sblock.blockedIdIntra
				}
			})
			this.client.emit('blockUser', sblock.myIdIntra)
		} catch (e:any) { ErrorDispatcher(e) }
    }

	async showBlocked(userId : string) : Promise<any> {
		const ret = await this.prisma.blacklist.findMany({
			where : {
				blockId : userId,
			}
		})
			.catch((e : any) => ErrorDispatcher(e));
		return ret;
	}
}
