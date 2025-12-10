import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";


const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    bio: {
        type: String
    },
    echos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Echo'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false
    },
    rifts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rift'
        }
    ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;