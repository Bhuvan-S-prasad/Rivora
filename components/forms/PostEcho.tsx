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
import { ChangeEvent, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
import { echoValidation } from '@/lib/validations/echoValidation';
import { Button } from '../ui/button';
import { createEcho } from '@/lib/actions/echo.actions';


interface Props {
    user: {
        id: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string;
        image: string;
        bio?: string;
    };
    btnTitle: string;
}







function PostEcho({ userId }: { userId: string }) {

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(echoValidation),
        defaultValues: {
            echo: "",
            accountId: userId,
        }
    });

    const onSubmit = async (values: z.infer<typeof echoValidation>) => {
        await createEcho({
            text: values.echo,
            author: userId,
            riftId: null,
            image: null,
            path: pathname,
        });

        router.push(pathname);
    }

    return (

        <Form {...form} >
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-10 flex flex-col justify-start gap-10">

                <FormField
                    control={form.control}
                    name="echo"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-4'>
                            <FormLabel className='text-base-semibold text-dark-2'>
                                content of Echo
                            </FormLabel>
                            <FormControl className='no-focus border-dark-4 bg-dark-3 text-dark-2 min-h-[300px]'>
                                <Textarea
                                    rows={15}
                                    {...field}

                                />
                            </FormControl>

                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="bg-primary-500">
                    Post Echo
                </Button>

            </form>
        </Form>

    )
}

export default PostEcho;