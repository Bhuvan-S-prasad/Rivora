import * as z from "zod";

export const userValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    name: z.string().min(3, { message: "Name must be at least 3 characters long" }).max(30, { message: "Name must be at most 30 characters long" }).nonempty(),
    username: z.string().min(3, { message: "Username must be at least 3 characters long" }).max(30, { message: "Username must be at most 30 characters long" }).nonempty(),
    bio: z.string().max(1000, { message: "Bio must be at most 1000 characters long" }),
})