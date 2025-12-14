import UserCard from "@/components/cards/UserCard";
import EchoesTab from "@/components/shared/EchoesTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs, riftTabs } from "@/constants";
import { fetchRiftDetails } from "@/lib/actions/rift.actions";
import { currentUser } from "@clerk/nextjs/server";
import { TabsContent } from "@radix-ui/react-tabs";


async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await currentUser();

    if (!user) return null;
    const riftDetails = await fetchRiftDetails(id);

    //if (!userInfo?.onboarded) redirect("/onboarding");

    return (
        <div className="flex flex-col">
            <div className="bg-white rounded-t-2xl border-x border-t border-b-0 border-gray-200 overflow-hidden">
                <ProfileHeader
                    accountId={riftDetails.id}
                    authUserId={user.id}
                    name={riftDetails.name}
                    username={riftDetails.username}
                    image={riftDetails.image}
                    bio={riftDetails.bio}
                    type="Rift"
                />

                <div className="mt-9">
                    <Tabs defaultValue="echos" className="w-full">
                        <TabsList className="flex w-full min-h-[50px] flex-1 items-center gap-3 bg-transparent text-gray-1 data-[state=active]:bg-transparent data-[state=active]:text-dark-1 data-[state=active]:shadow-none p-0 border-b border-gray-200">
                            {riftTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex min-h-[50px] flex-1 items-center gap-3 bg-transparent text-gray-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-dark-1 data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-dark-4 rounded-none px-5 py-3"
                                >
                                    {tab.icon}
                                    <p className="max-sm:hidden">{tab.label}</p>

                                    {tab.label === 'Echos' && (
                                        <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 text-tiny-medium text-light-2">
                                            {riftDetails?.echos?.length}
                                        </p>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="echos" className="w-full">
                            <EchoesTab
                                currentUserId={user.id}
                                accountId={riftDetails.id}
                                accountType="Rift"
                            />
                        </TabsContent>

                        <TabsContent value="members" className="w-full">
                            <section>
                                {riftDetails?.members.map((member: any) => (
                                    <UserCard
                                        key={member._id}
                                        id={member._id}
                                        name={member.name}
                                        username={member.username}
                                        image={member.image}
                                        personType="User"
                                    />
                                ))}


                            </section>

                        </TabsContent>

                        <TabsContent value="requests" className="w-full">
                            <EchoesTab
                                currentUserId={user.id}
                                accountId={riftDetails.id}
                                accountType="Rift"
                            />
                        </TabsContent>
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