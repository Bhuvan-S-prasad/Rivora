"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { followUser, unfollowUser } from "@/lib/actions/user.actions";

interface FollowButtonProps {
    currentUserId: string;
    targetUserId: string;
    isFollowing: boolean;
    variant?: "default" | "compact";
}

const FollowButton = ({
    currentUserId,
    targetUserId,
    isFollowing: initialIsFollowing,
    variant = "default"
}: FollowButtonProps) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    // Don't show button if viewing own profile
    if (currentUserId === targetUserId) {
        return null;
    }

    const handleFollowToggle = async () => {
        setIsLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(currentUserId, targetUserId);
                setIsFollowing(false);
            } else {
                await followUser(currentUserId, targetUserId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            // Revert on error
            setIsFollowing(isFollowing);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "compact") {
        return (
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollowToggle();
                }}
                disabled={isLoading}
                className={`min-w-[80px] rounded-lg px-3 py-1 text-small-regular transition-all ${isFollowing
                        ? "bg-gray-200 text-dark-1 hover:bg-red-100 hover:text-red-500"
                        : "bg-primary-500 text-light-1 hover:bg-primary-600"
                    }`}
            >
                {isLoading ? (
                    <span className="animate-pulse">...</span>
                ) : isFollowing ? (
                    "Following"
                ) : (
                    "Follow"
                )}
            </Button>
        );
    }

    return (
        <Button
            onClick={handleFollowToggle}
            disabled={isLoading}
            className={`min-w-[100px] rounded-lg px-4 py-2 text-small-regular transition-all ${isFollowing
                    ? "bg-gray-200 text-dark-1 hover:bg-red-100 hover:text-red-500"
                    : "bg-primary-500 text-light-1 hover:bg-primary-600"
                }`}
        >
            {isLoading ? (
                <span className="animate-pulse">...</span>
            ) : isFollowing ? (
                "Following"
            ) : (
                "Follow"
            )}
        </Button>
    );
};

export default FollowButton;
