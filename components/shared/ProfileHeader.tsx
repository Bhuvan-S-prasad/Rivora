"use client";

import Image from "next/image";
import FollowButton from "./FollowButton";
import { useState } from "react";
import FollowersList from "./FollowersList";
import FollowingList from "./FollowingList";

interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    type?: 'User' | 'Rift';
    isFollowing?: boolean;
    followersCount?: number;
    followingCount?: number;
}


const ProfileHeader = ({
    accountId,
    authUserId,
    name,
    username,
    image,
    bio,
    type,
    isFollowing = false,
    followersCount = 0,
    followingCount = 0
}: Props) => {
    const [showFollowingList, setShowFollowingList] = useState(false);
    const [showFollowersList, setShowFollowersList] = useState(false);
    const isOwnProfile = accountId === authUserId;

    return (
        <div className="flex w-full flex-col justify-start p-4">
            <div className="flex justify-between">
                <div className="flex flex-col gap-3">
                    <h2 className="text-left text-heading3-bold text-dark-1">
                        {name}
                    </h2>
                    <p className="text-base-medium text-gray-1">@{username}</p>
                    <p className="mt-6 max-w-lg text-base-regular text-dark-2">{bio}</p>
                </div>

                <div className="relative h-20 w-20 object-cover">
                    <Image
                        src={image}
                        alt="profile picture"
                        fill
                        className="rounded-full object-cover border"
                    />
                </div>
            </div>

            {type !== "Rift" && (
                <div className="mt-5 flex items-center gap-5">
                    {!isOwnProfile && (
                        <FollowButton
                            currentUserId={authUserId}
                            targetUserId={accountId}
                            isFollowing={isFollowing}
                        />
                    )}
                    <button
                        onClick={() => setShowFollowersList(true)}
                        className="text-base-medium text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
                    >
                        <span className="text-base-semibold mr-1 text-dark-1">{followersCount}</span>
                        followers
                    </button>
                    <button
                        onClick={() => setShowFollowingList(true)}
                        className="text-base-medium text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
                    >
                        <span className="text-base-semibold mr-1 text-dark-1">{followingCount}</span>
                        following
                    </button>
                </div>
            )}

            {showFollowersList && (
                <FollowersList
                    userId={accountId}
                    currentUserId={authUserId}
                    onClose={() => setShowFollowersList(false)}
                />
            )}

            {showFollowingList && (
                <FollowingList
                    userId={accountId}
                    currentUserId={authUserId}
                    onClose={() => setShowFollowingList(false)}
                />
            )}

            <div className="mt-12 h-0.5 w-full bg-dark-3" />
        </div>
    )
}

export default ProfileHeader