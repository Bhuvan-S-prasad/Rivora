'use client';

import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from '../ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { commentValidation } from '@/lib/validations/echoValidation';
import { Button } from '../ui/button';
import { addCommentToEcho } from '@/lib/actions/echo.actions';
import Image from 'next/image';

interface Props {
    echoId: string;
    currentUserImg: string;
    currentUserId: string;
}

const Comment = ({ echoId, currentUserImg, currentUserId }: Props) => {
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(commentValidation),
        defaultValues: {
            echo: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof commentValidation>) => {
        await addCommentToEcho(
            echoId,
            values.echo,
            JSON.parse(currentUserId),
            pathname
        );

        form.reset();
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-10 flex items-center gap-4 border-y border-y-dark-4 py-5 max-xs:flex-col"
            >
                <FormField
                    control={form.control}
                    name="echo"
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Image
                                    src={currentUserImg}
                                    alt="Profile image"
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input
                                    type="text"
                                    placeholder="Comment..."
                                    className="no-focus text-dark-1 outline-none"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="bg-primary-500 rounded-3xl px-8 py-2 text-small-regular! text-light-1 max-xs:w-full">
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default Comment;