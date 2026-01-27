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
import { ChangeEvent, useRef, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { usePathname, useRouter } from 'next/navigation';
import { echoValidation } from '@/lib/validations/echoValidation';
import { Button } from '../ui/button';
import { createEcho } from '@/lib/actions/echo.actions';
import { useUploadThing } from '@/lib/uploadthing';
import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useOrganization } from '@clerk/nextjs';

interface Props {
    userId: string;
    userImage: string;
    name?: string;
    username?: string;
}

function PostEcho({ userId, userImage, name, username }: Props) {

    const router = useRouter();
    const pathname = usePathname();
    const [files, setFiles] = useState<File[]>([]);
    const [fileUrls, setFileUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { startUpload } = useUploadThing("media");
    const { organization } = useOrganization();
    const [isPosting, setIsPosting] = useState(false);

    const form = useForm({
        resolver: zodResolver(echoValidation),
        defaultValues: {
            echo: "",
            accountId: userId,
        }
    });

    const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Limit to 4 images total
            if (files.length + newFiles.length > 4) {
                alert("You can only upload up to 4 images.");
                return;
            }

            setFiles(prev => [...prev, ...newFiles]);

            newFiles.forEach(file => {
                if (!file.type.includes('image')) return;

                const fileReader = new FileReader();
                fileReader.onload = (event) => {
                    const imageDataUrl = event.target?.result?.toString() || '';
                    setFileUrls(prev => [...prev, imageDataUrl]);
                }
                fileReader.readAsDataURL(file);
            });
        }
    }

    const removeImage = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setFileUrls(prev => prev.filter((_, i) => i !== index));
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    const onSubmit = async (values: z.infer<typeof echoValidation>) => {
        setIsPosting(true);

        let uploadedImageUrls: string[] = [];

        if (files.length > 0) {
            const imgRes = await startUpload(files);
            if (imgRes) {
                uploadedImageUrls = imgRes.map(res => res.ufsUrl);
            }
        }



        await createEcho({
            text: values.echo,
            author: userId,
            riftId: organization ? organization.id : null,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
            path: pathname,
        });

        form.reset();
        setFiles([]);
        setFileUrls([]);
        setIsPosting(false);
        router.push("/");
    }

    return (

        <Form {...form} >
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-5 flex flex-col justify-start p-4 sm:px-7 sm:py-4 border-b border-gray-200">

                <div className='flex gap-3 sm:gap-4 w-full'>
                    {/* User Avatar */}
                    {userImage && (
                        <div className='relative w-10 h-10 sm:w-12 sm:h-12 shrink-0'>
                            <Image
                                src={userImage}
                                alt="Profile photo"
                                fill
                                className='rounded-full object-cover'
                            />
                        </div>
                    )}

                    <div className='flex flex-col w-full gap-2 min-w-0'>
                        <div className='flex flex-col'>
                            <h4 className='text-base-semibold text-dark-1'>{name || 'User'}</h4>
                            <p className='text-small-regular text-dark-3 max-w-[200px] truncate'>@{username || 'username'}</p>
                        </div>


                        <FormField
                            control={form.control}
                            name="echo"
                            render={({ field }) => (
                                <FormItem className='flex flex-col w-full'>
                                    <FormControl className='no-focus border-none bg-transparent text-dark-1 p-0 shadow-none'>
                                        <Textarea
                                            rows={2}
                                            placeholder="What's new?"
                                            {...field}
                                            className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base-regular placeholder:text-dark-4 min-h-[50px] border-none bg-transparent shadow-none focus-visible:shadow-none outline-none"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {fileUrls.length > 0 && (
                            <div className={`mt-3 w-full ${fileUrls.length > 1 ? 'flex overflow-x-auto no-scrollbar gap-3 h-64' : ''}`}>
                                {fileUrls.map((url, index) => (
                                    <div
                                        key={index}
                                        className={`relative rounded-xl overflow-hidden group border border-dark-4/20 ${fileUrls.length === 1
                                            ? 'w-full h-auto max-h-[500px]'
                                            : 'h-full w-auto shrink-0 flex items-center justify-center bg-dark-4/5'
                                            }`}
                                    >
                                        <img
                                            src={url}
                                            alt={`preview-${index}`}
                                            className={`${fileUrls.length === 1
                                                ? 'w-full h-auto max-h-[500px] object-contain'
                                                : 'h-full w-auto object-contain'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="text-white w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-3">
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImage}
                                />
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="p-2 hover:bg-dark-3 rounded-full transition group"
                                    title="Add images"
                                >
                                    <ImageIcon className="text-gray-1 group-hover:text-primary-500 w-5 h-5 transition-colors" />
                                </button>

                                <span className="text-small-regular text-gray-1">
                                    {files.length > 0 ? `${files.length}/4` : ''}
                                </span>
                            </div>

                            <Button
                                type="submit"
                                className="bg-primary-500 rounded-full px-6 text-light-1 h-8 animate-in fade-in zoom-in duration-300"
                                disabled={isPosting}
                            >
                                {isPosting ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    </div>
                </div>

            </form>
        </Form>

    )
}

export default PostEcho;