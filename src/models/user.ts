import mongoose from 'mongoose';
const Schema = mongoose.Schema;
interface IUser extends mongoose.Document {
    name: string,
    points: number,
    access_token: string,
    request_count: number,
    requested_time: Date
}

const UserSchema = new Schema ({
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

UserSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true
});

export const User: mongoose.Model<IUser> = mongoose.model('user', UserSchema);