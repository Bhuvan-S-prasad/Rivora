import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers, checkIsFollowing } from "@/lib/actions/user.actions";
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

    // Get follow status for each user
    const usersWithFollowStatus = await Promise.all(
        result.users.map(async (person: { _id: string; id: string; name: string; username: string; image: string }) => {
            const isFollowing = await checkIsFollowing(user.id, person.id);
            return { ...person, isFollowing };
        })
    );

    return (


        <div className="flex flex-col">
            <div className="bg-white rounded-t-2xl border-x border-t border-b-0 border-gray-200 overflow-hidden">
                {usersWithFollowStatus.length === 0 ? (
                    <p className="no-result">No user</p>

                ) : (
                    <>
                        {usersWithFollowStatus.map((person) => (
                            <Link href={`/profile/${person.id}`} key={person.id}>
                                <UserCard
                                    id={person.id}
                                    name={person.name}
                                    username={person.username}
                                    image={person.image}
                                    personType="User"
                                    currentUserId={user.id}
                                    isFollowing={person.isFollowing}
                                />
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </div>

    )
}

export default Page;