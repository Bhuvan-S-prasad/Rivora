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
                        {activity.map((act) => {
                            // Determine the link based on activity type
                            const href = act.type === 'follow'
                                ? `/profile/${act.author.id}`
                                : `/echo/${act.parentId}`;

                            // Determine the activity message
                            const getMessage = () => {
                                switch (act.type) {
                                    case 'follow':
                                        return 'started following you';
                                    case 'like':
                                        return 'liked your echo';
                                    case 'reply':
                                        return 'replied to your echo';
                                    default:
                                        return '';
                                }
                            };

                            return (
                                <Link key={act._id || act.createdAt} href={href}>
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
                                                {getMessage()}
                                            </p>
                                        </div>

                                        {/* Activity type icon */}
                                        <div className="text-gray-400">
                                            {act.type === 'follow' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                                </svg>
                                            )}
                                            {act.type === 'like' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-red-500">
                                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                </svg>
                                            )}
                                            {act.type === 'reply' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                                </svg>
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </>
                ) : (
                    <p className="text-base-regular! text-light-3">No activity yet</p>
                )}
            </div>
        </section>
    )
}

export default Page