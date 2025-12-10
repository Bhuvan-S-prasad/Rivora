'use client';
import * as z from 'zod';
import { userValidation } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { updateUser } from '@/lib/actions/user.actions';
import { usePathname, useRouter } from 'next/navigation';


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

const AccountProfile = ({ user, btnTitle }: Props) => {

    const [files, setFiles] = useState<File[]>([])
    const { startUpload } = useUploadThing("imageUploader");
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(userValidation),
        defaultValues: {
            profile_photo: user?.image || "",
            name: (user?.firstName || "") + " " + (user?.lastName || ""),
            username: user?.username || "",
            bio: user?.bio || "",
        }
    });

    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));

            if (!file.type.includes('image')) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || '';

                fieldChange(imageDataUrl);
            }

            fileReader.readAsDataURL(file);
        }

    }

    const onSubmit = async (values: z.infer<typeof userValidation>) => {
        const blob = values.profile_photo;

        const hasImageChanged = isBase64Image(blob);

        try {
            if (hasImageChanged) {
                const imgRes = await startUpload(files)
                console.log("UploadThing Response:", imgRes);

                if (imgRes && imgRes[0].ufsUrl) {
                    values.profile_photo = imgRes[0].ufsUrl;
                }
            }

            await updateUser({
                userId: user.id,
                username: values.username,
                name: values.name,
                bio: values.bio,
                image: values.profile_photo,
                email: user.email,
                path: pathname
            });

            if (pathname === "/profile/edit") {
                router.back();
            } else {
                router.push('/');
            }
        } catch (error: any) {
            console.error("Error updating user:", error);
            alert(`Error updating profile: ${error.message}`);
        }
    }

    return (
        <Form {...form} >
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col justify-start gap-10">
                <FormField
                    control={form.control}
                    name="profile_photo"
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-4'>
                            <FormLabel className='account-form_image-label'>
                                {field.value ? (
                                    <Image
                                        src={field.value}
                                        alt="profile_photo"
                                        width={96}
                                        height={96}
                                        priority
                                        className='rounded-full object-contain'
                                    />
                                ) : (
                                    <Image
                                        src="/rivora-logo.png"
                                        alt="rivora-logo"
                                        width={96}
                                        height={96}
                                        priority
                                        className='rounded-full object-contain'
                                    />
                                )}
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    placeholder="Upload a photo"
                                    className='bg-white text-black border-gray-200 focus:bg-white focus:text-black'
                                    onChange={(e) => handleImage(e, (value: string) => field.onChange(value))}


                                />
                            </FormControl>

                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-4'>
                            <FormLabel className='text-base-semibold text-dark-2'>
                                Name
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-dark-1'>
                                <Input
                                    type="text"
                                    className='bg-white text-black border-gray-200 focus:bg-white focus:text-black'
                                    {...field}

                                />
                            </FormControl>

                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-4'>
                            <FormLabel className='text-base-semibold text-dark-2'>
                                Username
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-dark-1'>
                                <Input
                                    type="text"
                                    className='bg-white text-black border-gray-200 focus:bg-white focus:text-black'
                                    {...field}

                                />
                            </FormControl>

                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-4'>
                            <FormLabel className='text-base-semibold text-dark-2'>
                                Bio
                            </FormLabel>
                            <FormControl className='flex-1 text-base-semibold text-dark-1'>
                                <Textarea
                                    rows={10}
                                    className='bg-white text-black border-gray-200 focus:bg-white focus:text-black'
                                    {...field}

                                />
                            </FormControl>

                        </FormItem>
                    )}
                />


                <Button type="submit" className='bg-primary-500'>{btnTitle}</Button>
            </form>
        </Form>
    )
}


export default AccountProfile;