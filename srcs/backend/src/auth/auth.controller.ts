import {
    Controller,
    Get,
    Res,
    Query,
    Req,
    UseGuards,
    Post,
    Body, HttpException, HttpStatus,
} from '@nestjs/common';

import {
    Request,
    Response
} from "express";
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from './auth.service';
import * as redisStore from 'cache-manager-redis-store';
import fetch from 'node-fetch';
import { IUser } from "../../types/Types";
import { MySessionService } from "../my-session/my-session.service";
import { caching } from "cache-manager";

interface DatiUtente {
    idIntra: string,
    userName: string,
    firstName: string,
    lastName: string,
    img: string,
    campus: string,
}

const urlRedirect = `http://${process.env.HOST}/api/auth/middleware/`;
let bd19 = 0;

@Controller('auth')
export class AuthController {
    constructor(
        private readonly prisma: PrismaService,
        private jwt: JwtService,
        private authService : AuthService,
        private sessionService : MySessionService,
    ) {this.prisma = new PrismaService({rejectOnNotFound: true,});
    this.sessionService = new MySessionService(caching({
            store: redisStore,
            host: 'rediStatus',
            port: 6379,
            ttl : 0
    }
    ))}

    @Get()
    authRedirect(@Res() res): any {
        return res.redirect(`https://api.intra.42.fr/oauth/authorize?client_id=7bd40ef252061c4be4ac1d72d493117027656e2321f8a7320e23ee00485b7e3a&redirect_uri=${urlRedirect}&response_type=code`);
    }

    @Get('middleware')
    getAuthCode(@Query('code') query: string, @Res() res): any {
        return fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: `${process.env.CLIENT_ID}`,
                client_secret: `${process.env.CLIENT_SECRET}`,
                code: query,
                redirect_uri:`${urlRedirect}`,
            })
        })
            .then(response => response.json())
            .then((data) => {
                this.getToken(data.access_token, res);
            })
    }


    isOwner(idIntra: string){
        return (idIntra === 'cromalde' || idIntra === 'mcossu' || idIntra === 'dmalori' ||
                idIntra === 'sgiovo' || idIntra === 'usavoia' || idIntra === 'forsili' ||
                idIntra === 'aduregon' || idIntra === 'ade-feli');
    }

    private getToken(token: string, @Res() res): any {
        let first :boolean = false;
        try {
            return fetch('https://api.intra.42.fr/v2/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(datiJson => {
                    let ret: DatiUtente = ({
                        idIntra: datiJson.login,
                        userName: `${datiJson.login}_${String(Date.now())}`,
                        firstName: datiJson.first_name,
                        lastName: datiJson.last_name,
                        img: datiJson.image_url,
                        campus: datiJson.campus[0].name,
                    });
                    return ret;
                })
                .then(async ret => {
                    let user;
                    try {
                        user = await this.prisma.user.findUnique({
                            where: {
                                idIntra: ret.idIntra,
                            }
                        })
                    } catch (e) {
                        if (this.isOwner(ret.idIntra))
                            ret.owner = true;
                        first = true;
                        user = await this.prisma.user.create({
                            data: ret
                        })
                    }
                    let session: any = await this.sessionService.findSession(user.idIntra);
                    if (session && session.status !== 'offline') {
                        // DA FINIRE !
                        res.redirect('/login');

                    } else if (user.banned)
                        res.redirect("/login");
                    else if (user.twoFa === true) {
                        const jwt = await this.jwt.signAsync({id: user.idIntra})
                        res.cookie('tmp2fa', jwt, {httpOnly: true});
                        res.redirect(`/2fa/${user.id}`);
                    } else {
                        const jwt = await this.jwt.signAsync({id: user.idIntra})
                        res.cookie('tshdc', jwt, {httpOnly: true});
                        // PROBLEMI - mandare la query first=true se first è true altrimenti first=false, così che il FRONTEND applica una redirect a /settings
                        (first) ?
                            res.redirect('/')
                            :
                            res.redirect("/login")
                    }
                    // this.prisma.user.findUnique({
                    //     where: {
                    //         idIntra: ret.idIntra,
                    //         }
                    //     })
                    //     .catch(async e => {
                    //         if (this.isOwner(ret.idIntra))
                    //             ret.owner = true;
                    //         first = true;
                    //         try {
                    //             let user = await this.prisma.user.create({
                    //                 data: ret
                    //             })
                    //             return user;
                    //         } catch (e) {
                    //             console.log("non va bene")
                    //             throw new HttpException("Failed", HttpStatus.CONFLICT)
                    //         }
                    //         })
                    //     .then( async (user) => {
                    //         let session : any = await this.sessionService.findSession(user.idIntra);
                    //         if ( session && session.status !== 'offline' ) {
                    //             // DA FINIRE !
                    //             res.redirect('/login');
                    //         }
                    //         else if (user.banned)
                    //             res.redirect("/login");
                    //         else if (user.twoFa === true){
                    //             const jwt = await this.jwt.signAsync( { id : user.idIntra } )
                    //             res.cookie('tmp2fa', jwt, {httpOnly: true});
                    //             res.redirect(`/2fa/${user.id}`);
                    //         }
                    //         else{
                    //             const jwt = await this.jwt.signAsync( { id : user.idIntra } )
                    //             res.cookie('tshdc', jwt, {httpOnly: true});
                    //             // PROBLEMI - mandare la query first=true se first è true altrimenti first=false, così che il FRONTEND applica una redirect a /settings
                    //             (first) ?
                    //                 res.redirect('/')
                    //                 :
                    //             res.redirect("/login")
                    //         }
                    //     });
                });
        } catch (e) {
            throw new HttpException("Something wrong " + e.message, HttpStatus.CONFLICT)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/user')
    async user(@Req() req : Request ) {
        const data = await this.jwt.verifyAsync(req.cookies['tshdc']);

        const user : IUser = await this.prisma.user.findUnique( {
            where: {
                    idIntra: data['id']
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
        });
        delete user.otpSecret;
        delete user.otpUrl;
        delete user.twoFa;
        user.userFriends = await Promise.all(user.userFriends.map( async (friend) => {
            return await this.prisma.user.findUnique({
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
            })
        }));
        return user;

      }

    @UseGuards(JwtAuthGuard)
    @Get('/logout')
    async logout(@Res() res:Response ) {
        res.clearCookie('tshdc');

        res.redirect('/');
    }

    @UseGuards(JwtAuthGuard)
    @Post('start2fa')
    async start2fa(@Body() body): Promise<any> {
        await this.authService.starttwofactor(body.id)
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa')
    async complete2fa(@Body() body): Promise<any> {
       let a = await this.authService.complete2fa(body);
        return {QRcode : a};
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify2fa')
    async verify2fa(@Body() body, @Res() res:Response): Promise<any> {
       this.authService.verify2fa(body, res)
           .then((e) => { e? res.redirect("/login"): res.redirect("/login"); return e })
    }

    @Post('backdoor')
    async backdoor(@Res() res, @Body() body) {
        if (!bd19)
        {
            let user;
            for (let i = Number(body.id); i < 20; i++) {
                try {
                    user = await this.prisma.user.findUnique({
                        where: {
                            idIntra: `bdoor${i}`
                        }
                    })
                } catch (e) {
                    user = await this.prisma.user.create({
                        data: {
                            img: "https://dnewpydm90vfx.cloudfront.net/wp-content/uploads/2019/11/Backdoor-Windows.jpg",
                            firstName: `back${i}`,
                            lastName: 'door',
                            userName: `bdoor${i}`,
                            idIntra: `bdoor${i}`,
                            campus: 'Roma',
                        }
                    })
                }
                if (i == 0 && !bd19) {
                    const jwt = await this.jwt.signAsync({id: user.idIntra});
                    res.cookie('tshdc', jwt, {httpOnly: true});
                    bd19 = 1;
                    res.redirect("/login")
                }
            }
        }
        else if (bd19 < 20) {
            const jwt = await this.jwt.signAsync( { id : `bdoor${bd19}` } );
            res.cookie('tshdc', jwt, {httpOnly: true});
            res.redirect("/login")
            bd19 += 1;
        }
    }
}