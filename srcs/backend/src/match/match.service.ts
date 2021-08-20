import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";

@Injectable()
export class MatchService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async createMatch(match : any) : Promise<void> {
		try {
			await this.prisma.games.create({
				data: {
					idP1: match.idP1,
					idP2: match.idP2,
					idGame: match.idGame,
				}
			})
		} catch (e) {
			ErrorDispatcher(e)
		}
	}

	async updateMatch(result : {idGame:string, scoreP1: number, scoreP2: number}) : Promise<void> {
	    try {
		    let players = await this.prisma.games.findUnique({
			    where: {
				    idGame: result.idGame
			    },
			    select: {
				    idP1: true,
				    idP2: true,
			    }
		    })
		    if (players) {
			    let p1 = await this.prisma.user.findUnique({
				    where: {
					    idIntra: players.idP1
				    }
			    })
			    let p2 = await this.prisma.user.findUnique({
				    where: {
					    idIntra: players.idP2
				    }
			    })
			    if (p1 && p2) {
				    if (result.scoreP1 > result.scoreP2) {
					    p1.rank += Math.round(p2.rank * 0.05) + 1;
					    p2.rank -= Math.round(p2.rank * 0.05);
					    await this.prisma.user.update({
						    where: {
							    idIntra: p1.idIntra,
						    },
						    data: {
							    win: p1.win + 1,
							    rank: p1.rank,
						    },
					    })
					    await this.prisma.user.update({
						    where: {
							    idIntra: p2.idIntra,
						    },
						    data: {
							    loses: p2.loses + 1,
							    rank: p2.rank,
						    },
					    })
				    }
				    else {
					    p2.rank += Math.round(p1.rank * 0.05) + 1;
					    p1.rank -= Math.round(p1.rank * 0.05);
					    await this.prisma.user.update({
						    where: {
							    idIntra: p1.idIntra,
						    },
						    data: {
							    loses: p1.loses + 1,
							    rank: p1.rank,
						    },
					    })
					    await this.prisma.user.update({
						    where: {
							    idIntra: p2.idIntra,
						    },
						    data: {
							    win: p2.win + 1,
							    rank: p2.rank,
						    },
					    })
				    }
			    }
		    }
		    await this.prisma.games.update({
			    where: {
				    idGame: result.idGame
			    },
			    data: {
				    scoreP1: result.scoreP1,
				    scoreP2: result.scoreP2,
				    status: false
			    }
		    })
	    } catch (e) {
		    ErrorDispatcher(e)
	    }
	}

	async liveMatches() : Promise<any> {
		try {
			const ret = await this.prisma.games.findMany({
				where: {
					status: true
				}

			})
			return ret;
		} catch (e) {
			ErrorDispatcher(e)
		}
    }

    async allMatches() : Promise<any> {
		try {
			const ret = await this.prisma.games.findMany()
			return ret;
		} catch (e) {
			ErrorDispatcher(e)
		}
    }
}
