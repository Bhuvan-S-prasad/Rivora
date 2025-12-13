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

    // Transform likes to maintain compatibility with frontend which expects string[]
    const echosWithTransformedLikes = echos.map((echo: any) => ({
        ...echo,
        likes: echo.likes.map((like: any) => like.userId ? like.userId.toString() : like)
    }));

    const echosStringified = JSON.parse(JSON.stringify(echosWithTransformedLikes));

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
                    }
                ]
            }).lean().exec();

        // Transform likes for compatibility
        if (echo.likes) {
            echo.likes = echo.likes.map((like: any) => like.userId ? like.userId.toString() : like);
        }

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
    await connectToDB();

    try {
        const targetEcho = await Echo.findById(echoId).populate('author');

        if (!targetEcho) {
            throw new Error("Echo not found");
        }

        let parentIdToSave: string;
        let textToSave = commentText;
        let echoToUpdate: any;

        if (targetEcho.parentId) {

            let rootPost = await Echo.findById(targetEcho.parentId);
            while (rootPost && rootPost.parentId) {
                rootPost = await Echo.findById(rootPost.parentId);
            }

            if (!rootPost) {
                throw new Error("Root post not found");
            }

            parentIdToSave = rootPost._id.toString();
            textToSave = `@${targetEcho.author.username} ${commentText}`;
            echoToUpdate = rootPost;
            console.log(`Reply to comment/reply detected. Flattening to Post level. @${targetEcho.author.username}`);
        } else {
            parentIdToSave = echoId;
            echoToUpdate = targetEcho;
            console.log("Top level comment detected.");
        }

        const commentEcho = new Echo({
            text: textToSave,
            author: userId,
            parentId: parentIdToSave,
        });

        const savedCommentEcho = await commentEcho.save();

        echoToUpdate.children.push(savedCommentEcho._id);
        await echoToUpdate.save();

        revalidatePath(path);

    } catch (error: any) {
        console.error("Error adding comment to Echo:", error);
        throw new Error(`Error adding comment to Echo: ${error.message}`);
    }
}

export async function toggleLikeEcho(echoId: string, userId: string, path: string) {
    try {
        connectToDB();

        const echo = await Echo.findById(echoId);

        if (!echo) {
            throw new Error("Echo not found");
        }

        const user = await User.findOne({ id: userId });
        if (!user) {
            throw new Error("User not found");
        }
        const userMongoId = user._id;

        const isLiked = echo.likes ? echo.likes.some((like: any) =>
            (like.userId && like.userId.toString() === userMongoId.toString()) || like === userId
        ) : false;

        if (isLiked) {
            await Echo.findByIdAndUpdate(echoId, {
                $pull: { likes: { userId: userMongoId } }
            }, { strict: false });

            await Echo.findByIdAndUpdate(echoId, {
                $pull: { likes: userId }
            }, { strict: false });

        } else {
            await Echo.findByIdAndUpdate(echoId, {
                $push: { likes: { userId: userMongoId, createdAt: new Date() } }
            }, { strict: false });
        }

        revalidatePath(path);

    } catch (error: any) {
        console.error("Error toggling like:", error);
        throw new Error(`Error toggling like: ${error.message}`);
    }
}