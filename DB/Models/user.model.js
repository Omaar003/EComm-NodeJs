import { model, Schema } from "mongoose";
import pkg from 'bcrypt'
import { systemRoles } from "../../src/utils/systemRoles.js";
const userSchema = new Schema({
    userName: {
        type: String,
        required: true

    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isConfirmed: {
        type: Boolean,
        required: true,
        default: false,
    },
    role: {
        type: String,
        default: systemRoles.USER,
        enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: [{
        type: String,
        required: true,
    }],
    profilePicture: {
        secure_url: String,
        publid_id: String
    },
    status: {
        type: String,
        default: 'offline',
        enum: ['online', 'offline']
    },
    gender: {
        type: String,
        default: 'Not specified',
        enum: ['male', 'female', 'Not specified']
    },
    age: Number,
    token: String,
    forgetCode: String,
}, {
    timestamps: true,
})

userSchema.pre('save', function (next, hash) {
    this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS)
    next()
})
export const userModel = model('User', userSchema)