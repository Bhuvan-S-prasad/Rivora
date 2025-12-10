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

    const echos = await echoQuery.lean().exec();

    const echosStringified = JSON.parse(JSON.stringify(echos));

    const isNext = totalPostsCount > skipAmount + echos.length;

    return { echos: echosStringified, isNext };


}

export async function fetchEchoById(id: string) {
    connectToDB();

    try {
        const echo = await Echo.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: "_id id name image"
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    },
                    {
                        path: 'children',
                        model: Echo,
                        populate: {
                            path: 'author',
                            model: User,
                            select: "_id id name parentId image"
                        }

                    }
                ]
            }).lean().exec();

        return JSON.parse(JSON.stringify(echo));

    } catch (error) {
        console.error("Error fetching echo by ID:", error);
    }
}

export async function addCommentToEcho(
    echoId: string,
    commentText: string,
    userId: string,
    path: string,
) {
    connectToDB();

    try {
        const originalEcho = await Echo.findById(echoId);

        if (!originalEcho) {
            throw new Error("Thread not found");
        }

        const commentEcho = new Echo({
            text: commentText,
            author: userId,
            parentId: echoId,
        });

        const savedCommentEcho = await commentEcho.save();

        originalEcho.children.push(savedCommentEcho._id);

        await originalEcho.save();

        revalidatePath(path);

    } catch (error: any) {
        console.error("Error adding comment to thread:", error);
        throw new Error(`Error adding comment to thread: ${error.message}`);
    }
}

export async function toggleLikeEcho(echoId: string, userId: string, path: string) {
    try {
        connectToDB();

        const echo = await Echo.findById(echoId);

        if (!echo) {
            throw new Error("Echo not found");
        }

        const isLiked = echo.likes ? echo.likes.includes(userId) : false;

        if (isLiked) {
            // strict: false to allow MongoDB to handle the update
            await Echo.findByIdAndUpdate(echoId, {
                $pull: { likes: userId }
            }, { strict: false });
        } else {
            await Echo.findByIdAndUpdate(echoId, {
                $push: { likes: userId }
            }, { strict: false });
        }

        revalidatePath(path);

    } catch (error: any) {
        console.error("Error toggling like:", error);
        throw new Error(`Error toggling like: ${error.message}`);
    }
}