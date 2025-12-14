"use server";

import { QueryFilter, SortOrder } from "mongoose";

import Echo from "../models/echo.models";
import User from "../models/user.models";
import Rift from "../models/rift.models";
import { connectToDB } from "../mongoose";

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
        user.communities.push(createdRift._id);
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
        ]);

        return riftDetails;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching rift details:", error);
        throw error;
    }
}

export async function fetchRiftPosts(id: string) {
    try {
        connectToDB();

        const riftPosts = await Rift.findById(id).populate({
            path: "echoes",
            model: Echo,
            populate: [
                {
                    path: "author",
                    model: User,
                    select: "name image id", // Select the "name" and "_id" fields from the "User" model
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
                        select: "image _id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });

        if (!riftPosts) {
            return null;
        }

        const riftPostsWithTransformedEchoes = {
            ...riftPosts.toObject(),
            echoes: riftPosts.echoes.map((echo: any) => ({
                ...echo,
                rift: echo.riftId,
                likes: echo.likes ? echo.likes.map((like: any) => like.userId ? like.userId.toString() : like) : []
            }))
        };

        return riftPostsWithTransformedEchoes;
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
            .populate("members");

        // Count the total number of communities that match the search criteria (without pagination).
        const totalCommunitiesCount = await Rift.countDocuments(query);

        const rifts = await riftsQuery.exec();

        // Check if there are more communities beyond the current page.
        const isNext = totalCommunitiesCount > skipAmount + rifts.length;

        return { rifts, isNext };
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
        user.communities.push(rift._id);
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

        // Remove the rift's _id from the communities array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { communities: riftIdObject._id } }
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
            throw new Error("Rift not found");
        }

        // Delete all Echo associated with the rift
        await Echo.deleteMany({ rift: riftId });

        // Find all users who are part of the rift
        const riftUsers = await User.find({ communities: riftId });

        // Remove the rift from the 'communities' array for each user
        const updateUserPromises = riftUsers.map((user) => {
            user.communities.pull(riftId);
            return user.save();
        });

        await Promise.all(updateUserPromises);

        return deletedRift;
    } catch (error) {
        console.error("Error deleting rift: ", error);
        throw error;
    }
}