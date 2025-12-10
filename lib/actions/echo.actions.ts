"use server";

import Echo from "../models/echo.models";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

interface Params {
    text: string;
    author: string;
    riftId: string | null;
    images?: string[] | null;
    path: string;
}


export async function createEcho({ text, author, riftId, images, path }: Params) {
    try {
        connectToDB();

        const createEcho = await Echo.create({
            text,
            author,
            riftId: null,
            images,
        });

        await User.findByIdAndUpdate(author, {
            $push: { echos: createEcho._id }
        });

        revalidatePath(path);
    }
    catch (error) {
        console.error("Error creating echo:", error);
    }
}

export async function fetchEchoes(pageNumber = 1, pageSize = 20) {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const echoQuery = Echo.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })

    const totalPostsCount = await Echo.countDocuments({ parentId: { $in: [null, undefined] } })

    const echos = await echoQuery.exec();

    const isNext = totalPostsCount > skipAmount + echos.length;

    return { echos, isNext };


}