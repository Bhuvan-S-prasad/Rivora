import mongoose from "mongoose";
import { unique } from "next/dist/build/utils";
import { Children } from "react";


const echoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    riftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rift',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    image: {
        type: String,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Echo',
    },

    Children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Echo',
        }
    ],


});

const Echo = mongoose.models.Echo || mongoose.model('Echo', echoSchema);

export default Echo;