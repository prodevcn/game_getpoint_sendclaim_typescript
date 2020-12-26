import passportJWT from 'passport-jwt';
const JwtStrategy = passportJWT.Strategy;
const JwtExtract = passportJWT.ExtractJwt;
import {User} from '../models/user';
import conf from '../config';
const opts =
{
    jwtFromRequest: JwtExtract.fromAuthHeaderAsBearerToken(),
    secretOrKey: conf.SECRET_KEY
}

export default (passport: any) => {
    passport.use(
        new JwtStrategy(opts, (jwtPayload, done) => {
            User.findOne({'name': jwtPayload.name})
                .then(data => {
                    if(data) {
                        return done(null, data);
                    }
                    return done(null, false);
                })
                .catch(err => {
                    // tslint:disable-next-line: no-console
                    console.error(err);
                    return done(null, false);
                })
        })
    );
}