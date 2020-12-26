import jwt_decode from 'jwt-decode';
import {User} from '../models/user';
import conf from '../config';
const timers: any[] = [];
export function random_points () {
    const ran = Math.floor(Math.random() * 100) + 1;
    return ran;
}

export function decode_token (token: string, callback: any) {
    const decoded: any = jwt_decode(token);
    return callback(decoded);
}

export function stopExtra (name: any) {
    clearInterval(timers[name]);
}

export function setExtraPoints ( name: any) {
    // tslint:disable-next-line: radix
    const extra = parseInt(conf.EXTRA_POINTS);
    timers[name] = setInterval(async () => {
        const user = await User.findOne({name});
        const oldPoints = user.points;
        await User.updateOne({name}, {points: oldPoints + extra});
    }, 60000);
}