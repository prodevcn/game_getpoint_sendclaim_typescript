"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    points: {
        type: Number,
        default: 0
    },
    access_token: {
        type: String,
        required: true
    },
    request_count: {
        type: Number,
        default: 0
    },
    requested_time: {
        type: Date,
        default: new Date().getTime()
    }
});
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
UserSchema.set('toJSON', {
    virtuals: true
});
exports.User = mongoose_1.default.model('user', UserSchema);
//# sourceMappingURL=user.js.map