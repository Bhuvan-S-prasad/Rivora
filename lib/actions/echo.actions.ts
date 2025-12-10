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