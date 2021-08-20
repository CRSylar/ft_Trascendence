import {
    Body,
    Controller,
    Get,
    Post
} from '@nestjs/common';

import { MatchService } from "./match.service";


@Controller('match')
export class MatchController {
    constructor(
        private readonly matchService : MatchService
    ) {}

    @Post('new')
    async createMatch(@Body() match : any) : Promise<void> {
        await this.matchService.createMatch(match)

    }

    @Post('update')
    async updateMatch(@Body() result : {
        idGame:string,
        scoreP1: number,
        scoreP2: number
    }) : Promise<void> {
        await this.matchService.updateMatch(result)

    }

    @Get('live')
    async liveMatches() : Promise<any> {
        return await this.matchService.liveMatches()
    }

    @Get('all')
    async allMatches() : Promise<any> {
        return await this.matchService.allMatches()
    }
}
