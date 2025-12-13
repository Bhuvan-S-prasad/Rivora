"use client"

import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
    id: string;
    name: string;
    username: string;
    image: string;
    personType: string;
}



const UserCard = ({ id, name, username, image, personType }: Props) => {

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

            <Button
                className="user-card_btn"
                onClick={() => router.push(`/profile/${id}`)}
            >
                Follow
            </Button>

        </article>
    )
}

export default UserCard