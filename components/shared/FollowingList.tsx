"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFollowing } from "@/lib/actions/user.actions";
import FollowButton from "./FollowButton";

interface FollowingUser {
    _id: string;
    id: string;
    name: string;
    username: string;
    image: string;
}

interface FollowingListProps {
    userId: string;
    currentUserId: string;
    onClose: () => void;
}

const FollowingList = ({ userId, currentUserId, onClose }: FollowingListProps) => {
    const [following, setFollowing] = useState<FollowingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const data = await getFollowing(userId);
                setFollowing(data);
            } catch (error) {
                console.error("Error fetching following:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowing();
    }, [userId]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-heading4-medium text-dark-1">Following</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[60vh] p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : following.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Not following anyone yet</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {following.map((user) => (
                                <div key={user._id} className="flex items-center gap-3">
                                    <Link href={`/profile/${user.id}`} onClick={onClose} className="flex items-center gap-3 flex-1">
                                        <div className="relative h-12 w-12 shrink-0">
                                            <Image
                                                src={user.image}
                                                alt={user.name}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base-semibold text-dark-1 truncate">{user.name}</h4>
                                            <p className="text-small-medium text-gray-1 truncate">@{user.username}</p>
                                        </div>
                                    </Link>
                                    {currentUserId !== user.id && (
                                        <FollowButton
                                            currentUserId={currentUserId}
                                            targetUserId={user.id}
                                            isFollowing={true}
                                            variant="compact"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowingList;
