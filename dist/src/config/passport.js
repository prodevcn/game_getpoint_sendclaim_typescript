"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const JwtStrategy = passport_jwt_1.default.Strategy;
const JwtExtract = passport_jwt_1.default.ExtractJwt;
const user_1 = require("../models/user");
const config_1 = __importDefault(require("../config"));
const opts = {
    jwtFromRequest: JwtExtract.fromAuthHeaderAsBearerToken(),
    secretOrKey: config_1.default.SECRET_KEY
};
exports.default = (passport) => {
    passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
        user_1.User.findOne({ 'name': jwtPayload.name })
            .then(data => {
            if (data) {
                return done(null, data);
            }
            return done(null, false);
        })
            .catch(err => {
            // tslint:disable-next-line: no-console
            console.error(err);
            return done(null, false);
        });
    }));
};
//# sourceMappingURL=passport.js.map