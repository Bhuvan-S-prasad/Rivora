import mongoose from "mongoose";

const riftSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    username: {
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    echos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Echo'
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

const Community = mongoose.models.Rift || mongoose.model('Rift', riftSchema)

export default Community;