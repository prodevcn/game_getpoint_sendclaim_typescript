"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setExtraPoints = exports.stopExtra = exports.decode_token = exports.random_points = void 0;
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const user_1 = require("../models/user");
const config_1 = __importDefault(require("../config"));
const timers = [];
function random_points() {
    const ran = Math.floor(Math.random() * 100) + 1;
    return ran;
}
exports.random_points = random_points;
function decode_token(token, callback) {
    const decoded = jwt_decode_1.default(token);
    return callback(decoded);
}
exports.decode_token = decode_token;
function stopExtra(name) {
    clearInterval(timers[name]);
}
exports.stopExtra = stopExtra;
function setExtraPoints(name) {
    // tslint:disable-next-line: radix
    const extra = parseInt(config_1.default.EXTRA_POINTS);
    timers[name] = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        const user = yield user_1.User.findOne({ name });
        const oldPoints = user.points;
        yield user_1.User.updateOne({ name }, { points: oldPoints + extra });
    }), 60000);
}
exports.setExtraPoints = setExtraPoints;
//# sourceMappingURL=index.js.map