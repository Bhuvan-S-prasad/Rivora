"use server";

import { QueryFilter, SortOrder } from "mongoose";

import Echo from "../models/echo.models";
import User from "../models/user.models";
import Rift from "../models/rift.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

export async function createRift(
    id: string,
    name: string,
    username: string,
    image: string,
    bio: string,
    createdById: string // Change the parameter name to reflect it's an id
) {
    try {
        connectToDB();

        // Find the user with the provided unique id
        const user = await User.findOne({ id: createdById });

        if (!user) {
            throw new Error("User not found"); // Handle the case if the user with the id is not found
        }

        const newRift = new Rift({
            id,
            name,
            username,
            image,
            bio,
            createdBy: user._id, // Use the mongoose ID of the user
        });

        const createdRift = await newRift.save();

        // Update User model
        user.rifts.push(createdRift._id);
        await user.save();

        return createdRift;
    } catch (error) {
        // Handle any errors
        console.error("Error creating rift:", error);
        throw error;
    }
}

export async function fetchRiftDetails(id: string) {
    try {
        connectToDB();

        const riftDetails = await Rift.findOne({ id }).populate([
            "createdBy",
            {
                path: "members",
                model: User,
                select: "name username image _id id",
            },
            {
                path: "requests.userId",
                model: User,
                select: "name username image _id id",
                strictPopulate: false,
            },
        ]);

        return JSON.parse(JSON.stringify(riftDetails));
    } catch (error) {
        // Handle any errors
        console.error("Error fetching rift details:", error);
        throw error;
    }
}

export async function fetchRiftPosts(id: string) {
    try {
        connectToDB();

        const riftPosts = await Rift.findOne({ id }).populate({
            path: "echos",
            model: Echo,
            populate: [
                {
                    path: "author",
                    model: User,
                    select: "name image id _id",
                },
                {
                    path: "riftId",
                    model: Rift,
                    select: "_id id name image"
                },
                {
                    path: "children",
                    model: Echo,
                    populate: {
                        path: "author",
                        model: User,
                        select: "image _id name id",
                    },
                },
            ],
        }).lean();

        if (!riftPosts) {
            return null;
        }

        // Transform echos to ensure proper serialization
        const transformedEchos = (riftPosts.echos || []).map((echo: any) => ({
            ...echo,
            _id: echo._id?.toString() || echo._id,
            rift: echo.riftId,
            author: echo.author ? {
                ...echo.author,
                _id: echo.author._id?.toString() || echo.author._id,
            } : null,
            likes: echo.likes ? echo.likes.map((like: any) => like.userId ? like.userId.toString() : like) : [],
            children: (echo.children || []).map((child: any) => ({
                ...child,
                _id: child._id?.toString() || child._id,
            })),
            createdAt: echo.createdAt,
        }));

        const result = {
            ...riftPosts,
            echos: transformedEchos,
        };

        return JSON.parse(JSON.stringify(result));
    } catch (error) {
        // Handle any errors
        console.error("Error fetching rift posts:", error);
        throw error;
    }
}

export async function fetchRifts({
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
}: {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        // Calculate the number of communities to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");

        // Create an initial query object to filter rifts.
        const query: QueryFilter<typeof Rift> = {};

        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // Define the sort options for the fetched communities based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        // Create a query to fetch the communities based on the search and sort criteria.
        const riftsQuery = Rift.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .populate("members")
            .populate({
                path: "requests.userId",
                model: User,
                select: "name username image _id id",
                strictPopulate: false,
            })
            .lean();

        // Count the total number of communities that match the search criteria (without pagination).
        const totalCommunitiesCount = await Rift.countDocuments(query);

        const rifts = await riftsQuery.exec();

        // Check if there are more communities beyond the current page.
        const isNext = totalCommunitiesCount > skipAmount + rifts.length;

        return { rifts: JSON.parse(JSON.stringify(rifts)), isNext };
    } catch (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
}

export async function addMemberToRift(
    riftId: string,
    memberId: string
) {
    try {
        connectToDB();

        // Find the rift by its unique id
        const rift = await Rift.findOne({ id: riftId });

        if (!rift) {
            throw new Error("Rift not found");
        }

        // Find the user by their unique id
        const user = await User.findOne({ id: memberId });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if the user is already a member of the rift
        if (rift.members.includes(user._id)) {
            throw new Error("User is already a member of the rift1");
        }

        // Add the user's _id to the members array in the rift
        rift.members.push(user._id);
        await rift.save();

        // Add the rift's _id to the communities array in the user
        user.rifts.push(rift._id);
        await user.save();

        return rift;
    } catch (error) {
        // Handle any errors
        console.error("Error adding member to rift:", error);
        throw error;
    }
}

export async function removeUserFromRift(
    userId: string,
    riftId: string
) {
    try {
        connectToDB();

        const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
        const riftIdObject = await Rift.findOne(
            { id: riftId },
            { _id: 1 }
        );

        if (!userIdObject) {
            throw new Error("User not found");
        }

        if (!riftIdObject) {
            throw new Error("Rift not found");
        }

        await Rift.updateOne(
            { _id: riftIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // Remove the rift's _id from the rifts array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { rifts: riftIdObject._id } }
        );

        return { success: true };
    } catch (error) {
        // Handle any errors
        console.error("Error removing user from rift:", error);
        throw error;
    }
}

export async function updateRiftInfo(
    riftId: string,
    name: string,
    username: string,
    image: string
) {
    try {
        connectToDB();

        // Find the     rift by its _id and update the information
        const updatedRift = await Rift.findOneAndUpdate(
            { id: riftId },
            { name, username, image }
        );

        if (!updatedRift) {
            throw new Error("Rift not found");
        }

        return updatedRift;
    } catch (error) {
        // Handle any errors
        console.error("Error updating rift information:", error);
        throw error;
    }
}

export async function deleteRift(riftId: string) {
    try {
        connectToDB();

        // Find the rift by its ID and delete it
        const deletedRift = await Rift.findOneAndDelete({
            id: riftId,
        });

        if (!deletedRift) {
            // Rift may have already been deleted or never existed in our DB
            console.log(`Rift with id ${riftId} not found, skipping deletion`);
            return null;
        }

        // Delete all Echoes associated with the rift using MongoDB ObjectId
        await Echo.deleteMany({ riftId: deletedRift._id });

        // Find all users who are part of the rift using MongoDB ObjectId
        const riftUsers = await User.find({ rifts: deletedRift._id });

        // Remove the rift from the 'communities' array for each user
        const updateUserPromises = riftUsers.map((user) => {
            user.rifts.pull(deletedRift._id);
            return user.save();
        });

        await Promise.all(updateUserPromises);

        return deletedRift;
    } catch (error) {
        console.error("Error deleting rift: ", error);
        throw error;
    }
}

// Request to join a rift
export async function requestToJoinRift(riftId: string, userId: string) {
    try {
        connectToDB();

        const rift = await Rift.findOne({ id: riftId });
        if (!rift) {
            throw new Error("Rift not found");
        }

        const user = await User.findOne({ id: userId });
        if (!user) {
            throw new Error("User not found");
        }

        // Check if user is already a member
        if (rift.members.includes(user._id)) {
            throw new Error("User is already a member of this rift");
        }

        // Check if user already has a pending request
        // Initialize requests array if it doesn't exist (for existing rifts)
        if (!rift.requests) {
            rift.requests = [];
        }

        const existingRequest = rift.requests.find(
            (req: any) => req.userId?.toString() === user._id.toString()
        );
        if (existingRequest) {
            throw new Error("Request already pending");
        }

        // Add the request
        rift.requests.push({ userId: user._id, createdAt: new Date() });
        await rift.save();

        revalidatePath(`/rifts/${riftId}`);
        revalidatePath('/rifts');

        return { success: true };
    } catch (error) {
        console.error("Error requesting to join rift:", error);
        throw error;
    }
}

// Approve a join request
export async function approveJoinRequest(riftId: string, requesterId: string) {
    try {
        connectToDB();

        const rift = await Rift.findOne({ id: riftId });
        if (!rift) {
            throw new Error("Rift not found");
        }

        const requester = await User.findOne({ id: requesterId });
        if (!requester) {
            throw new Error("Requester not found");
        }

        // Remove from requests
        rift.requests = rift.requests.filter(
            (req: any) => req.userId?.toString() !== requester._id.toString()
        );

        // Add to members
        if (!rift.members.includes(requester._id)) {
            rift.members.push(requester._id);
        }
        await rift.save();

        // Add rift to user's rifts
        if (!requester.rifts.includes(rift._id)) {
            requester.rifts.push(rift._id);
            await requester.save();
        }

        revalidatePath(`/rifts/${riftId}`);
        revalidatePath('/rifts');

        return { success: true };
    } catch (error) {
        console.error("Error approving join request:", error);
        throw error;
    }
}

// Reject a join request
export async function rejectJoinRequest(riftId: string, requesterId: string) {
    try {
        connectToDB();

        const rift = await Rift.findOne({ id: riftId });
        if (!rift) {
            throw new Error("Rift not found");
        }

        const requester = await User.findOne({ id: requesterId });
        if (!requester) {
            throw new Error("Requester not found");
        }

        // Remove from requests
        rift.requests = rift.requests.filter(
            (req: any) => req.userId?.toString() !== requester._id.toString()
        );
        await rift.save();

        revalidatePath(`/rifts/${riftId}`);
        revalidatePath('/rifts');

        return { success: true };
    } catch (error) {
        console.error("Error rejecting join request:", error);
        throw error;
    }
}