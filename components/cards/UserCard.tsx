"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import FollowButton from "../shared/FollowButton";

interface Props {
    id: string;
    name: string;
    username: string;
    image: string;
    personType: string;
    currentUserId?: string;
    isFollowing?: boolean;
}

const UserCard = ({
    id,
    name,
    username,
    image,
    personType,
    currentUserId,
    isFollowing = false
}: Props) => {

    const router = useRouter()

    return (
        <article className="user-card p-5">
            <div className="relative h-12 w-12 shrink-0">
                <Image
                    src={image}
                    alt="user"
                    fill
                    className="rounded-full object-cover"
                />
            </div>

            <div className="flex-1 text-ellipsis">
                <h4 className="text-base-semibold">{name}</h4>
                <p className="text-small-medium">@{username}</p>
            </div>

            {currentUserId ? (
                <FollowButton
                    currentUserId={currentUserId}
                    targetUserId={id}
                    isFollowing={isFollowing}
                    variant="compact"
                />
            ) : (
                <button
                    className="user-card_btn"
                    onClick={() => router.push(`/profile/${id}`)}
                >
                    View
                </button>
            )}

        </article>
    )
}

export default UserCard