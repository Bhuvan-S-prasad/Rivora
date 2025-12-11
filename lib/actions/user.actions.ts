'use server';

import { revalidatePath } from "next/cache";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import Echo from "../models/echo.models";


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

        const echoes = await User.findOne({ id: userId })
            .populate({
                path: "echos",
                model: Echo,
                populate: {
                    path: 'children',
                    model: Echo,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id _id'
                    }
                }
            })
            .lean();

        return JSON.parse(JSON.stringify(echoes));
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error}`);
    }
}