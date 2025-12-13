import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";


async function Page() {
    const user = await currentUser()

    if (!user) return null;

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) redirect("/onboarding");

    const result = await fetchUsers({
        userId: user.id,
        searchString: "",
        pageNumber: 1,
        pageSize: 20
    })

    return (


        <div className="flex flex-col">
            <div className="bg-white rounded-t-2xl border-x border-t border-b-0 border-gray-200 overflow-hidden">
                {result.users.length === 0 ? (
                    <p className="no-result">No user</p>

                ) : (
                    <>
                        {result.users.map((person: { _id: string; id: string; name: string; username: string; image: string }) => (
                            <Link href={`/profile/${person.id}`} key={person.id}>
                                <UserCard
                                    id={person.id}
                                    name={person.name}
                                    username={person.username}
                                    image={person.image}
                                    personType="User" />
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </div>

    )
}

export default Page;