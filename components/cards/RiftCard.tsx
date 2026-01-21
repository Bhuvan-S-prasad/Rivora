"use client"

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { requestToJoinRift } from "@/lib/actions/rift.actions";
import { useState } from "react";

interface Props {
    id: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    members: { _id: string; id: string; image: string }[];
    requests?: { userId: { _id: string; id: string } }[];
    currentUserId?: string;
}

const RiftCard = ({ id, name, username, image, bio, members, requests = [], currentUserId }: Props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(
        requests.some((req) => req.userId?.id === currentUserId)
    );

    const isMember = members.some((member) => member.id === currentUserId);

    const handleJoinRequest = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUserId || isMember || hasPendingRequest) return;

        setIsLoading(true);
        try {
            await requestToJoinRift(id, currentUserId);
            setHasPendingRequest(true);
        } catch (error) {
            console.error("Error requesting to join:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonContent = () => {
        if (isMember) return "Joined";
        if (hasPendingRequest) return "Pending";
        if (isLoading) return "...";
        return "Join";
    };

    const isDisabled = isMember || hasPendingRequest || isLoading;

    return (
        <article className="user-card p-5">
            <div className="relative h-12 w-12 shrink-0">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="rounded-full object-cover"
                />
            </div>

            <div className="flex-1 text-ellipsis">
                <h4 className="text-base-semibold">{name}</h4>
                <p className="text-small-medium text-gray-1">@{username}</p>
            </div>

            <Button
                className={`user-card_btn ${isDisabled ? 'opacity-70' : ''}`}
                onClick={handleJoinRequest}
                disabled={isDisabled}
            >
                {getButtonContent()}
            </Button>

        </article>
    )
}

export default RiftCard
