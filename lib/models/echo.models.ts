import mongoose from "mongoose";


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
    images: [
        {
            type: String,
        }
    ],
    likes: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Echo',
    },

    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Echo',
        }
    ],


});

const Echo = mongoose.models.Echo || mongoose.model('Echo', echoSchema);

export default Echo;