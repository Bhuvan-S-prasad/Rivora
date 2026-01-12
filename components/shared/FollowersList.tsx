"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFollowers } from "@/lib/actions/user.actions";
import FollowButton from "./FollowButton";

interface FollowerUser {
    _id: string;
    id: string;
    name: string;
    username: string;
    image: string;
}

interface FollowersListProps {
    userId: string;
    currentUserId: string;
    onClose: () => void;
}

const FollowersList = ({ userId, currentUserId, onClose }: FollowersListProps) => {
    const [followers, setFollowers] = useState<FollowerUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const data = await getFollowers(userId);
                setFollowers(data);
            } catch (error) {
                console.error("Error fetching followers:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowers();
    }, [userId]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-heading4-medium text-dark-1">Followers</h2>
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
                    ) : followers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No followers yet</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {followers.map((user) => (
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
                                            isFollowing={false}
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

export default FollowersList;
