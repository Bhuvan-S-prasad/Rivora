"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Repeat, Share2 } from "lucide-react";

import { formatTimeAgo } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { toggleLikeEcho } from "@/lib/actions/echo.actions";

// Add useState to imports
import { useState } from "react";

// Update Props
interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image: string;
        id: string;
    }
    rift: {
        id: string;
        name: string;
        image: string;
    } | null
    images: string[] | null;
    likes: string[];
    createdAt: Date;
    comments: any[]; // Changed to any[] to support recursive structure
    isCommented?: boolean;
    hideReplyList?: boolean;
}

const EchoCard = ({
    id,
    currentUserId,
    parentId,
    content,
    author,
    rift,
    images,
    likes,
    createdAt,
    comments = [],
    isCommented,
    hideReplyList,
}: Props) => {
    const [showReplies, setShowReplies] = useState(false);
    const pathname = usePathname();
    const isLiked = likes.includes(currentUserId);

    const handleLike = async () => {
        await toggleLikeEcho(id, currentUserId, pathname);
    };

    return (
        <article className={`flex w-full flex-col ${isCommented ? 'px-0 xs:px-7 mb-4' : 'p-7 border-b border-gray-200'}`}> {/* Added mb-4 for spacing */}
            <div className="flex items-start justify-between">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <Link href={`/profile/${author?.id}`} className="relative h-11 w-11">
                            <Image
                                src={author?.image || '/assets/icons/user.svg'} // Fallback image
                                alt="Profile Image"
                                fill
                                className="cursor-pointer rounded-full object-cover"
                            />
                        </Link>
                    </div>

                    <div className="flex w-full flex-col">
                        <div className="flex items-center gap-1">
                            <Link href={`/profile/${author?.id}`} className="w-fit">
                                <h4 className="cursor-pointer text-base-semibold text-dark-1 hover:underline">
                                    {author?.name || 'Unknown User'}
                                </h4>
                            </Link>
                            <span className="text-small-regular text-gray-500">·</span>
                            <p className="text-small-regular text-gray-500" suppressHydrationWarning>{formatTimeAgo(createdAt)}</p>
                        </div>

                        <Link href={`/echo/${id}`}>
                            <p className="mt-2 text-small-regular text-dark-2 whitespace-pre-wrap">
                                {content}
                            </p>
                        </Link>

                        <div className="mt-5 flex flex-col gap-3">
                            {images && images.length > 0 && (
                                <div className={`w-full ${images.length > 1 ? 'flex overflow-x-auto no-scrollbar gap-3 h-64' : ''}`}>
                                    {images.map((url, index) => (
                                        <div
                                            key={index}
                                            className={`relative rounded-xl overflow-hidden group border border-light-4/20 ${images.length === 1
                                                ? 'w-full h-auto max-h-[500px]'
                                                : 'h-full w-auto shrink-0 flex items-center justify-center bg-light-4/5'
                                                }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`post-image-${index}`}
                                                className={`${images.length === 1
                                                    ? 'w-full h-auto max-h-[500px] object-contain'
                                                    : 'h-full w-auto object-contain'
                                                    }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex items-center gap-6">
                            {/* Heart */}
                            <div onClick={handleLike} className="flex gap-2 items-center group cursor-pointer">
                                {isLiked ? (
                                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                ) : (
                                    <Heart className="w-5 h-5 text-gray-1 group-hover:text-red-500 transition-colors" />
                                )}
                                {likes.length > 0 && (
                                    <p className={`text-subtle-medium ${isLiked ? 'text-red-500' : 'text-gray-1 group-hover:text-red-500'}`}>
                                        {likes.length}
                                    </p>
                                )}
                            </div>

                            {/* Reply */}
                            <Link href={`/echo/${id}`}>
                                <div className="flex gap-2 items-center group cursor-pointer">
                                    <MessageCircle className="w-5 h-5 text-gray-1 group-hover:text-primary-500 transition-colors" />
                                    {comments.length > 0 && (
                                        <p className="text-subtle-medium text-gray-1 group-hover:text-primary-500">
                                            {comments.length}
                                        </p>
                                    )}
                                </div>
                            </Link>

                            {/* Share */}
                            <div className="flex gap-2 items-center group cursor-pointer">
                                <Share2 className="w-5 h-5 text-gray-1 group-hover:text-blue transition-colors" />
                            </div>

                            {/* Comment */}
                            {isCommented && comments.length > 0 && (
                                <Link href={`/echo/${id}`} className="flex gap-2 items-center group cursor-pointer">
                                    <p className="mt-1 text-subtle-medium">{comments.length} replies </p>
                                </Link>
                            )}
                        </div>

                        {/* Nested Comments Section */}
                        {!hideReplyList && comments.length > 0 && (
                            <div className='mt-4 w-full'>
                                <button
                                    className='text-subtle-medium text-gray-500 hover:text-primary-500 flex items-center gap-2 cursor-pointer mb-2'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowReplies(!showReplies);
                                    }}
                                >
                                    <div className="w-4 h-px bg-slate-200"></div>
                                    {showReplies ? "Hide replies" : `View ${comments.length} replies`}
                                </button>

                                {showReplies && (
                                    <div className='flex flex-col gap-4 pl-4 border-l-2 border-slate-100'>
                                        {comments.map((comment: any) => (
                                            <EchoCard
                                                key={comment._id}
                                                id={comment._id}
                                                currentUserId={currentUserId}
                                                parentId={comment.parentId}
                                                content={comment.text}
                                                author={comment.author}
                                                rift={comment.rift}
                                                images={comment.images}
                                                likes={comment.likes ? comment.likes : []}
                                                createdAt={comment.createdAt}
                                                comments={comment.children}
                                                isCommented={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default EchoCard;