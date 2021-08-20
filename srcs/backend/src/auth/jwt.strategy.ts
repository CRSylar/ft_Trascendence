import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";


var cookieExtractor = function (req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['tshdc'];
        if (!token)
            token = req.cookies['tmp2fa'];
    }
    return token;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy ) {
    constructor() {
        super(
            {
                jwtFromRequest : ExtractJwt.fromExtractors([cookieExtractor]),
                ignoreExpiration: false,
                secretOrKey: process.env.SECRET,
            }
        )
    }

    validate(payload: any){
        if (!payload)
            throw new HttpException("not autorized", HttpStatus.UNAUTHORIZED)
        return { id: payload.id };
    }
}