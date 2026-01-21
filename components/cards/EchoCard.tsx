"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Send, Copy, Check } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { formatTimeAgo } from "@/lib/utils";
import { toggleLikeEcho } from "@/lib/actions/echo.actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image: string;
        id: string;
    };
    rift: {
        id: string;
        name: string;
        image: string;
    } | null;
    images: string[] | null;
    likes: string[];
    createdAt: Date;
    comments: any[];
    isCommented?: boolean;
    hideReplyList?: boolean;
}

const EchoCard = ({
    id,
    currentUserId,
    content,
    author,
    rift,
    images,
    likes,
    createdAt,
    comments = [],
    isCommented,
}: Props) => {
    const pathname = usePathname();
    const isLiked = likes.includes(currentUserId);
    const [isCopied, setIsCopied] = useState(false);

    const handleLike = async () => {
        await toggleLikeEcho(id, currentUserId, pathname);
    };

    const handleCopy = () => {
        const shareUrl = `${window.location.origin}/echo/${id}`;
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/echo/${id}` : '';

    return (
        <article
            className={`flex w-full flex-col ${isCommented ? "px-0 xs:px-7 mb-4" : "p-7 border-b border-gray-200"
                }`}
        >
            <div className="flex flex-row gap-4 min-w-0">
                {/* Avatar */}
                <Link href={`/profile/${author.id}`} className="relative h-11 w-11 shrink-0">
                    <Image
                        src={author.image || "/assets/icons/user.svg"}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                    />
                </Link>

                {/* Main Content */}
                <div className="flex flex-col w-full min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center gap-1 w-full">
                        <Link href={`/profile/${author.id}`}>
                            <h4 className="text-base-semibold text-dark-1 hover:underline">
                                {author.name}
                            </h4>
                        </Link>

                        <span className="text-small-regular text-gray-500">·</span>

                        <p
                            className="text-small-regular text-gray-500"
                            suppressHydrationWarning
                        >
                            {formatTimeAgo(createdAt)}
                        </p>

                        {/* Rift badge */}
                        {!isCommented && rift && (
                            <Link
                                href={`/rifts/${rift.id}`}
                                className="ml-auto flex items-center gap-2 text-subtle-medium text-gray-400 hover:text-primary-500"
                            >
                                <span className="truncate max-w-[120px]">{rift.name}</span>
                                <Image
                                    src={rift.image}
                                    alt={rift.name}
                                    width={16}
                                    height={16}
                                    className="rounded-full object-cover"
                                />
                            </Link>
                        )}
                    </div>

                    {/* Content */}
                    <Link href={`/echo/${id}`}>
                        <p className="mt-2 text-small-regular text-dark-2 whitespace-pre-wrap">
                            {(content || "").split(/(@\w+)/g).map((part, index) =>
                                part.startsWith("@") ? (
                                    <span
                                        key={index}
                                        className="text-primary-500 font-semibold mr-1"
                                    >
                                        {part}
                                    </span>
                                ) : (
                                    <span key={index}>{part}</span>
                                )
                            )}
                        </p>
                    </Link>

                    {/* Images */}
                    {images && images.length > 0 && (
                        <div
                            className={`mt-4 ${images.length > 1
                                ? "flex gap-3 overflow-x-auto no-scrollbar h-64"
                                : ""
                                }`}
                        >
                            {images.map((url, index) => (
                                <div
                                    key={index}
                                    className={`relative rounded-xl overflow-hidden border border-light-4/20 ${images.length === 1
                                        ? "w-full max-h-[500px]"
                                        : "h-full shrink-0 bg-light-4/5"
                                        }`}
                                >
                                    <img
                                        src={url}
                                        alt={`post-image-${index}`}
                                        className={`${images.length === 1
                                            ? "w-full h-auto object-contain"
                                            : "h-full w-auto object-contain"
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-6">
                        <div
                            onClick={handleLike}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <Heart
                                className={`w-5 h-5 transition ${isLiked
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-1 group-hover:text-red-500"
                                    }`}
                            />
                            {likes.length > 0 && (
                                <span
                                    className={`text-subtle-medium ${isLiked ? "text-red-500" : "text-gray-1"
                                        }`}
                                >
                                    {likes.length}
                                </span>
                            )}
                        </div>

                        <Link href={`/echo/${id}`}>
                            <div className="flex items-center gap-2 cursor-pointer group">
                                <MessageCircle className="w-5 h-5 text-gray-1 group-hover:text-primary-500" />
                                {comments.length > 0 && (
                                    <span className="text-subtle-medium text-gray-1 group-hover:text-primary-500">
                                        {comments.length}
                                    </span>
                                )}
                            </div>
                        </Link>

                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer group">
                                    <Send className="w-5 h-5 text-gray-1 group-hover:text-blue-500" />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white">
                                <DialogHeader>
                                    <DialogTitle>Share Echo</DialogTitle>
                                    <DialogDescription>
                                        Share this echo with your friends or copy the link below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="link" className="sr-only">
                                            Link
                                        </Label>
                                        <Input
                                            id="link"
                                            defaultValue={shareUrl}
                                            readOnly
                                            className="bg-gray-50 border-gray-200 text-dark-1 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary-500"
                                        />
                                    </div>
                                    <Button type="button" size="sm" className="px-3 bg-primary-500 hover:bg-primary-500/90 text-white" onClick={handleCopy}>
                                        <span className="sr-only">Copy</span>
                                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="bg-gray-100 text-dark-1 hover:bg-gray-200"
                                        onClick={handleCopy}
                                    >
                                        {isCopied ? "Copied" : "Copy Link"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default EchoCard;
