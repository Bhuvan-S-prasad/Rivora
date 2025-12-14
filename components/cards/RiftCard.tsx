"use client"

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
    id: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    members: { image: string }[];
}

const RiftCard = ({ id, name, username, image, bio, members }: Props) => {

    const router = useRouter()
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
                className="user-card_btn"
                onClick={() => router.push(`/rifts/${id}`)}
            >
                View
            </Button>

        </article>
    )
}

export default RiftCard
