import Image from "next/image";
import { Button } from "../ui/button";

interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    image: string;
    bio: string;
}


const ProfileHeader = ({
    accountId,
    authUserId,
    name,
    username,
    image,
    bio
}: Props) => {
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

            {/* change after adding follow and unfollow functionality */}

            <div className="mt-5 flex items-center gap-5">
                <Button className="min-w-[74px] rounded-lg bg-primary-500 px-4 py-2 text-small-regular text-light-1">
                    Follow
                </Button>
                <p className="text-base-medium text-gray-400">
                    <span className="text-base-semibold mr-1">12</span>
                    followers
                </p>
            </div>

            <div className="mt-12 h-0.5 w-full bg-dark-3" />
        </div>
    )
}

export default ProfileHeader