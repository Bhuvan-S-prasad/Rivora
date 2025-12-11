import EchoCard from "@/components/cards/EchoCard"
import { fetchEchoById } from "@/lib/actions/echo.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) return null;

    const user = await currentUser();
    if (!user) return null

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) redirect('/onboarding');

    const echo = await fetchEchoById(id);

    return (
        <section className="relative">
            <div>
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
                    hideReplyList={true}
                />
            </div>

            <div className="mt-7">
                <Comment
                    echoId={echo._id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>

            <div className="mt-10">
                {echo.children.map((childItem: any) => (
                    <EchoCard
                        key={childItem._id}
                        id={childItem._id}
                        currentUserId={user?.id || ""}
                        parentId={childItem.parentId}
                        content={childItem.text}
                        author={childItem.author}
                        rift={childItem.rift}
                        images={childItem.images}
                        likes={childItem.likes ? childItem.likes : []}
                        createdAt={childItem.createdAt}
                        comments={childItem.children}
                        isCommented
                    />
                ))}

            </div>

        </section>

    )
}

export default Page