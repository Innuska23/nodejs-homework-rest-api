const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const users = new Schema(
    {
        password: {
            type: String,
            required: [true, 'Set password for user'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
        },
        subscription: {
            type: String,
            enum: ["starter", "pro", "business"],
            default: "starter"
        },
        verify: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            required: [true, 'Verification token is required'],
        },
        token: String,
        avatarURL: String,
    },
    { versionKey: false, timestamps: true }
);

const Users = mongoose.model("user", users);

module.exports = Users;