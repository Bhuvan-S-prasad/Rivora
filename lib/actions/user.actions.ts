'use server';

import { revalidatePath } from "next/cache";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import Echo from "../models/echo.models";
import { QueryFilter, SortOrder } from "mongoose";
import Rift from "../models/rift.models";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    email: string;
    path: string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    email,
    path,
}: Params): Promise<void> {
    await connectToDB();

    try {

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                email,
                onboarded: true,
            },
            {
                upsert: true,
            }
        );

        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    }
    catch (error) {
        throw new Error(`Failed to update user: ${error}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId }).lean()
        // .populate({})
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user: ${error}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        const user = await User.findOne({ id: userId })
            .populate({
                path: "echos",
                model: Echo,
                populate: [
                    {
                        path: "riftId",
                        model: Rift,
                        select: "_id id name image"
                    },
                    {
                        path: 'children',
                        model: Echo,
                        populate: {
                            path: 'author',
                            model: User,
                            select: 'name image id _id'
                        }
                    }
                ]
            })
            .lean();

        if (!user) {
            return null;
        }

        user.echos = user.echos.map((echo: any) => ({
            ...echo,
            rift: echo.riftId,
            likes: echo.likes ? echo.likes.map((like: any) => like.userId ? like.userId.toString() : like) : []
        }));

        return JSON.parse(JSON.stringify(user));
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error}`);
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: any = {
            id: { $ne: userId },
        }

        if (searchString.trim()! == '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .select("_id id name username image");

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const usersStringified = JSON.parse(JSON.stringify(users));

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users: usersStringified, isNext };
    }
    catch (error: any) {
        throw new Error(`Failed to fetch users: ${error}`);
    }
}


export async function getActivity(userId: string) {
    try {
        connectToDB();

        const userEchos = await Echo.find({ author: userId });
        console.log("User Echoes Found:", userEchos.length);

        const childEchoIds = userEchos.reduce((acc, userEcho) => {
            return acc.concat(userEcho.children)
        }, [])
        console.log("Child Echo IDs collected:", childEchoIds);

        const replies = await Echo.find({
            _id: { $in: childEchoIds },
            author: { $ne: userId } // Exclude self-replies
        }).populate({
            path: "author",
            model: User,
            select: "name image id _id"
        });
        console.log("Replies Found:", replies.length);



        let likesActivity: any[] = [];

        userEchos.forEach((echo) => {
            if (echo.likes && echo.likes.length > 0) {
                echo.likes.forEach((like: any) => {
                    if (like.userId && like.userId.toString() !== userId) {
                        likesActivity.push({
                            type: 'like',
                            author: like.userId,
                            createdAt: like.createdAt,
                            parentId: echo._id,
                            text: echo.text
                        });
                    } else if (typeof like === 'string' && like !== userId) {

                    }
                });
            }
        });

        const likeAuthorIds = likesActivity.map(item => item.author);

        const likeAuthors = await User.find({ _id: { $in: likeAuthorIds } }).select("name image id _id");

        const authorMap = new Map(likeAuthors.map((user: any) => [user._id.toString(), user]));

        const hydratedLikes = likesActivity.map(activity => {
            const author = authorMap.get(activity.author.toString());
            return {
                ...activity,
                author: author ? {
                    name: author.name,
                    image: author.image,
                    id: author.id,
                    _id: author._id
                } : null
            };
        }).filter(item => item.author !== null);

        const repliesActivity = replies.map((reply) => ({
            type: 'reply',
            author: {
                name: reply.author.name,
                image: reply.author.image,
                id: reply.author.id,
                _id: reply.author._id
            },
            createdAt: reply.createdAt,
            parentId: reply.parentId,
            text: reply.text,
            _id: reply._id
        }));

        // Get follow activity - fetch user's followers with timestamps
        const currentUser = await User.findOne({ _id: userId });
        let followsActivity: any[] = [];

        if (currentUser && currentUser.followers && currentUser.followers.length > 0) {
            // Get follower user details
            const followerIds = currentUser.followers.map((f: any) => f.userId || f);
            const followerUsers = await User.find({ _id: { $in: followerIds } }).select("name image id _id");
            const followerMap = new Map(followerUsers.map((user: any) => [user._id.toString(), user]));

            followsActivity = currentUser.followers
                .filter((f: any) => f.userId) // Only include new format followers with timestamps
                .map((follower: any) => {
                    const user = followerMap.get(follower.userId.toString());
                    if (!user) return null;
                    return {
                        type: 'follow',
                        author: {
                            name: user.name,
                            image: user.image,
                            id: user.id,
                            _id: user._id
                        },
                        createdAt: follower.createdAt,
                        _id: `follow-${follower.userId}-${follower.createdAt}`
                    };
                })
                .filter((item: any) => item !== null);
        }

        const activity = [...repliesActivity, ...hydratedLikes, ...followsActivity].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return activity;

    } catch (error) {
        console.error("Error fetching activity:", error);
        throw new Error(`Failed to fetch activity: ${error}`);
    }
}

// Follow a user
export async function followUser(currentUserId: string, targetUserId: string) {
    try {
        await connectToDB();

        // Get both users by their clerk id
        const currentUser = await User.findOne({ id: currentUserId });
        const targetUser = await User.findOne({ id: targetUserId });

        if (!currentUser || !targetUser) {
            throw new Error("User not found");
        }

        // Check if already following (handle undefined following array for existing users)
        const followingArray = currentUser.following || [];
        if (followingArray.some((id: any) => id.toString() === targetUser._id.toString())) {
            return { success: false, message: "Already following this user" };
        }

        // Add target to current user's following
        await User.findByIdAndUpdate(currentUser._id, {
            $addToSet: { following: targetUser._id }
        });

        // Add current user to target's followers (with timestamp for activity)
        await User.findByIdAndUpdate(targetUser._id, {
            $push: { followers: { userId: currentUser._id, createdAt: new Date() } }
        });

        revalidatePath(`/profile/${targetUserId}`);
        revalidatePath(`/profile/${currentUserId}`);

        return { success: true, message: "Successfully followed user" };
    } catch (error) {
        console.error("Error following user:", error);
        throw new Error(`Failed to follow user: ${error}`);
    }
}

// Unfollow a user
export async function unfollowUser(currentUserId: string, targetUserId: string) {
    try {
        await connectToDB();

        const currentUser = await User.findOne({ id: currentUserId });
        const targetUser = await User.findOne({ id: targetUserId });

        if (!currentUser || !targetUser) {
            throw new Error("User not found");
        }

        // Remove target from current user's following
        await User.findByIdAndUpdate(currentUser._id, {
            $pull: { following: targetUser._id }
        });

        // Remove current user from target's followers
        await User.findByIdAndUpdate(targetUser._id, {
            $pull: { followers: { userId: currentUser._id } }
        });

        revalidatePath(`/profile/${targetUserId}`);
        revalidatePath(`/profile/${currentUserId}`);

        return { success: true, message: "Successfully unfollowed user" };
    } catch (error) {
        console.error("Error unfollowing user:", error);
        throw new Error(`Failed to unfollow user: ${error}`);
    }
}

// Check if a user is following another user
export async function checkIsFollowing(currentUserId: string, targetUserId: string) {
    try {
        await connectToDB();

        const currentUser = await User.findOne({ id: currentUserId });
        const targetUser = await User.findOne({ id: targetUserId });

        if (!currentUser || !targetUser) {
            return false;
        }

        // Handle undefined following array for existing users
        const followingArray = currentUser.following || [];
        return followingArray.some((id: any) => id.toString() === targetUser._id.toString());
    } catch (error) {
        console.error("Error checking follow status:", error);
        return false;
    }
}

// Get a user's following list
export async function getFollowing(userId: string) {
    try {
        await connectToDB();

        const user = await User.findOne({ id: userId });

        if (!user || !user.following || user.following.length === 0) {
            return [];
        }

        // Manually fetch the followed users to avoid strictPopulate issues
        const followingUsers = await User.find({
            _id: { $in: user.following }
        }).select("_id id name username image");

        return JSON.parse(JSON.stringify(followingUsers));
    } catch (error) {
        console.error("Error fetching following:", error);
        throw new Error(`Failed to fetch following list: ${error}`);
    }
}

// Get a user's followers list
export async function getFollowers(userId: string) {
    try {
        await connectToDB();

        const user = await User.findOne({ id: userId });

        if (!user || !user.followers || user.followers.length === 0) {
            return [];
        }

        // Extract user IDs from followers (handle both old and new format)
        const followerIds = user.followers.map((f: any) => f.userId || f);

        // Manually fetch the follower users to avoid strictPopulate issues
        const followerUsers = await User.find({
            _id: { $in: followerIds }
        }).select("_id id name username image");

        return JSON.parse(JSON.stringify(followerUsers));
    } catch (error) {
        console.error("Error fetching followers:", error);
        throw new Error(`Failed to fetch followers list: ${error}`);
    }
}

// Get follow counts for a user
export async function getFollowCounts(userId: string) {
    try {
        await connectToDB();

        const user = await User.findOne({ id: userId });

        if (!user) {
            return { followingCount: 0, followersCount: 0 };
        }

        return {
            followingCount: user.following?.length || 0,
            followersCount: user.followers?.length || 0
        };
    } catch (error) {
        console.error("Error fetching follow counts:", error);
        return { followingCount: 0, followersCount: 0 };
    }
}

export async function updateUserBio({
    userId,
    bio,
    path
}: {
    userId: string;
    bio: string;
    path: string;
}) {
    try {
        await connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            { bio: bio }
        );

        if (path === '/profile/edit') {
            revalidatePath(path);
        } else { // Revalidate the profile page directly if path is provided
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to update user bio: ${error.message}`);
    }
}