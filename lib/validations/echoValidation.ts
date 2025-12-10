import * as z from "zod";

export const echoValidation = z.object({
    echo: z.string().nonempty().min(3, { message: "minimum 3 characters" }),
    accountId: z.string()
})

export const commentValidation = z.object({
    echo: z.string().nonempty().min(3, { message: "minimum 3 characters" }),
})