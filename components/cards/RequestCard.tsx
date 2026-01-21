"use client"

import Image from "next/image";
import { Button } from "../ui/button";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/actions/rift.actions";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface Props {
    riftId: string;
    userId: string;
    name: string;
    username: string;
    image: string;
}

const RequestCard = ({ riftId, userId, name, username, image }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isResolved, setIsResolved] = useState(false);
    const pathname = usePathname();

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await approveJoinRequest(riftId, userId);
            setIsResolved(true);
        } catch (error) {
            console.error("Error approving request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await rejectJoinRequest(riftId, userId);
            setIsResolved(true);
        } catch (error) {
            console.error("Error rejecting request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isResolved) {
        return null;
    }

    return (
        <article className="user-card p-5">
            <div className="relative h-12 w-12 shrink-0">
                <Image
                    src={image || "/assets/profile.svg"}
                    alt={name}
                    fill
                    className="rounded-full object-cover"
                />
            </div>

            <div className="flex-1 text-ellipsis">
                <h4 className="text-base-semibold">{name}</h4>
                <p className="text-small-medium text-gray-1">@{username}</p>
            </div>

            <div className="flex gap-2">
                <Button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-small-regular"
                    onClick={handleApprove}
                    disabled={isLoading}
                >
                    {isLoading ? "..." : "Approve"}
                </Button>
                <Button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-small-regular"
                    onClick={handleReject}
                    disabled={isLoading}
                >
                    {isLoading ? "..." : "Reject"}
                </Button>
            </div>
        </article>
    )
}

export default RequestCard
