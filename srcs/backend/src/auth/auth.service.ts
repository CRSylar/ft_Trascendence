import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { GeneratedSecret } from "speakeasy";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from '@nestjs/jwt';
import { Response} from "express";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";

@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache )
        {this.prisma = new PrismaService({rejectOnNotFound: true,})}

        async starttwofactor(id : number): Promise<any> {
        let otp = await this.prisma.user.findUnique({
                where: {
                    id : id,
                },
                select: {
                    otpSecret : true,
                }
            })
            if (otp.otpSecret === "") {
                let secret : GeneratedSecret = speakeasy.generateSecret();
                await this.prisma.user.update({
                    where: {
                        id: id,
                    },
                    data: {
                        otpSecret: secret.base32,
                        otpUrl : secret.otpauth_url,
                    },
                })
            }
        }

        async complete2fa(body : any) : Promise<string> {
        let secret : {otpUrl: string, twoFa: boolean} = await this.prisma.user.findUnique({
              where: {
                  id : body.id
              },
              select : {
                  twoFa:true,
                  otpUrl: true,
              }
          });

          if (!secret.twoFa)
              return
//             throw new HttpException("VATTENEAFFACULO", HttpStatus.UNAUTHORIZED);
          return (await qrcode.toDataURL(secret.otpUrl) )
        }

        async verify2fa(body: any, res: Response) : Promise<boolean> {
            let user = await this.prisma.user.findUnique({
                where:{
                    id : body.id
                },
                select:{
                    idIntra : true,
                    otpSecret : true,
                }
            });
            let verified = speakeasy.totp.verify({
                secret: user.otpSecret,
                encoding: 'base32',
                token: body.totp });
            if (verified) {
                res.clearCookie('tmp2fa');
                const jwt = await this.jwt.signAsync( { id : user.idIntra } );
                res.cookie('tshdc', jwt, {httpOnly: true});
                return true;
            }
            else{
                res.clearCookie('tmp2fa');
                return false;
            }
        }
}