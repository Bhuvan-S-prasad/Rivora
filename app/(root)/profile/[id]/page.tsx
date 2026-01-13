import EchoesTab from "@/components/shared/EchoesTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import { fetchUser, checkIsFollowing, getFollowCounts } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import { redirect } from "next/navigation";


async function Page({ params }: { params: Promise<{ id: string }> }) {

    const user = await currentUser();

    if (!user) return null;

    const { id } = await params;

    const userInfo = await fetchUser(id);


    if (!userInfo) return null;

    // Fetch follow status and counts
    const isFollowing = await checkIsFollowing(user.id, id);
    const { followersCount, followingCount } = await getFollowCounts(id);

    //if (!userInfo?.onboarded) redirect("/onboarding");

    return (
        <div className="flex flex-col">
            <div className="bg-white rounded-t-2xl border-x border-t border-b-0 border-gray-200 overflow-hidden">
                <ProfileHeader
                    accountId={userInfo.id}
                    authUserId={user.id}
                    name={userInfo.name || ""}
                    username={userInfo.username || ""}
                    image={userInfo.image || ""}
                    bio={userInfo.bio || ""}
                    isFollowing={isFollowing}
                    followersCount={followersCount}
                    followingCount={followingCount}
                />

                <div className="mt-9">
                    <Tabs defaultValue="echos" className="w-full">
                        <TabsList className="flex w-full min-h-[50px] flex-1 items-center gap-3 bg-transparent text-gray-1 data-[state=active]:bg-transparent data-[state=active]:text-dark-1 data-[state=active]:shadow-none p-0 border-b border-gray-200">
                            {profileTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex min-h-[50px] flex-1 items-center gap-3 bg-transparent text-gray-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-dark-1 data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-dark-4 rounded-none px-5 py-3"
                                >
                                    {tab.icon}
                                    <p className="max-sm:hidden">{tab.label}</p>

                                    {tab.label === 'Echos' && (
                                        <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 text-tiny-medium text-light-2">
                                            {userInfo?.echos?.filter((e: any) => !e.parentId).length}
                                        </p>
                                    )}
                                    {tab.label === 'Replies' && (
                                        <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 text-tiny-medium text-light-2">
                                            {userInfo?.echos?.filter((e: any) => e.parentId).length}
                                        </p>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {profileTabs.map((tab) => (
                            <TabsContent value={tab.value} key={`content-${tab.value}`} className="w-full">
                                <EchoesTab
                                    currentUserId={user.id}
                                    accountId={userInfo.id}
                                    accountType="User"
                                    tabType={tab.value}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>

                </div>

                {/* <section className="flex flex-col">
                    {result.echos.length === 0 ? (
                        <p className="no-result p-4">No echos found</p>
                    ) : (
                        <>
                            {result.echos.map((echo: any) => (
                                <EchoCard
                                    key={echo._id}
                                    id={echo._id}
                                    currentUserId={user?.id || ""}
                                    parentId={echo.parentId}
                                    content={echo.text}
                                    author={echo.author}
                                    rift={echo.rift}
                                    images={echo.images}
                                    likes={echo.likes ? echo.likes : []}
                                    createdAt={echo.createdAt}
                                    comments={echo.children}
                                />
                            ))}
                        </>
                    )} */}

                {/* / </section> */}
            </div>
        </div>
    )
}

export default Page;