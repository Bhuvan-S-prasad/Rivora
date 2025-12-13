import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

async function Page() {

    const user = await currentUser();

    if (!user) return null;

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) redirect('/onboarding');

    const activity = await getActivity(userInfo._id);

    return (
        <section>
            <div className="flex flex-col gap-5">
                {activity.length > 0 ? (
                    <>
                        {activity.map((act) => (
                            <Link key={act._id || act.createdAt} href={`/echo/${act.parentId}`}>
                                <article className="activity-card">
                                    <div className="relative w-8 h-8">
                                        <Image
                                            src={act.author.image}
                                            alt="Profile Picture"
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 flex gap-1 items-center">
                                        <p className="text-small-regular! text-gray-500">
                                            <span className="mr-1 text-primary-500 font-bold">
                                                {act.author.name}
                                            </span>{" "}
                                            {act.type === 'like' ? 'liked your echo' : 'replied to your echo'}
                                        </p>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </>
                ) : (
                    <p className="text-base-regular! text-light-3">No activity yet</p>
                )}
            </div>
        </section>
    )
}

export default Page