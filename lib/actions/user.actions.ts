'use server';

import { revalidatePath } from "next/cache";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import Echo from "../models/echo.models";
import { QueryFilter, SortOrder } from "mongoose";
import Rift from "../models/rift.models";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    email: string;
    path: string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    email,
    path,
}: Params): Promise<void> {
    await connectToDB();

    try {

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                email,
                onboarded: true,
            },
            {
                upsert: true,
            }
        );

        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    }
    catch (error) {
        throw new Error(`Failed to update user: ${error}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId }).lean()
        // .populate({})
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user: ${error}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        const user = await User.findOne({ id: userId })
            .populate({
                path: "echos",
                model: Echo,
                populate: [
                    {
                        path: "riftId",
                        model: Rift,
                        select: "_id id name image"
                    },
                    {
                        path: 'children',
                        model: Echo,
                        populate: {
                            path: 'author',
                            model: User,
                            select: 'name image id _id'
                        }
                    }
                ]
            })
            .lean();

        if (!user) {
            return null;
        }

        user.echos = user.echos.map((echo: any) => ({
            ...echo,
            rift: echo.riftId,
            likes: echo.likes ? echo.likes.map((like: any) => like.userId ? like.userId.toString() : like) : []
        }));

        return JSON.parse(JSON.stringify(user));
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error}`);
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: QueryFilter<typeof User> = {
            id: { $ne: userId },
        }

        if (searchString.trim()! == '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .select("_id id name username image");

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const usersStringified = JSON.parse(JSON.stringify(users));

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users: usersStringified, isNext };
    }
    catch (error: any) {
        throw new Error(`Failed to fetch users: ${error}`);
    }
}


export async function getActivity(userId: string) {
    try {
        connectToDB();

        const userEchos = await Echo.find({ author: userId });
        console.log("User Echoes Found:", userEchos.length);

        const childEchoIds = userEchos.reduce((acc, userEcho) => {
            return acc.concat(userEcho.children)
        }, [])
        console.log("Child Echo IDs collected:", childEchoIds);

        const replies = await Echo.find({
            _id: { $in: childEchoIds },
            author: { $ne: userId } // Exclude self-replies
        }).populate({
            path: "author",
            model: User,
            select: "name image id _id"
        });
        console.log("Replies Found:", replies.length);



        let likesActivity: any[] = [];

        userEchos.forEach((echo) => {
            if (echo.likes && echo.likes.length > 0) {
                echo.likes.forEach((like: any) => {
                    if (like.userId && like.userId.toString() !== userId) {
                        likesActivity.push({
                            type: 'like',
                            author: like.userId,
                            createdAt: like.createdAt,
                            parentId: echo._id,
                            text: echo.text
                        });
                    } else if (typeof like === 'string' && like !== userId) {

                    }
                });
            }
        });

        const likeAuthorIds = likesActivity.map(item => item.author);

        const likeAuthors = await User.find({ _id: { $in: likeAuthorIds } }).select("name image id _id");

        const authorMap = new Map(likeAuthors.map((user: any) => [user._id.toString(), user]));

        const hydratedLikes = likesActivity.map(activity => {
            const author = authorMap.get(activity.author.toString());
            return {
                ...activity,
                author: author ? {
                    name: author.name,
                    image: author.image,
                    id: author.id,
                    _id: author._id
                } : null
            };
        }).filter(item => item.author !== null);

        const repliesActivity = replies.map((reply) => ({
            type: 'reply',
            author: {
                name: reply.author.name,
                image: reply.author.image,
                id: reply.author.id,
                _id: reply.author._id
            },
            createdAt: reply.createdAt,
            parentId: reply.parentId,
            text: reply.text,
            _id: reply._id
        }));

        const activity = [...repliesActivity, ...hydratedLikes].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return activity;

    } catch (error) {
        console.error("Error fetching activity:", error);
        throw new Error(`Failed to fetch activity: ${error}`);
    }
}