import PostEcho from "@/components/forms/PostEcho";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id)

    if (!userInfo?.onboarded) redirect("/onboarding");
    return (
        <main>
            <h1 className="head-text">Create Echo</h1>
            <PostEcho userId={userInfo?._id} />
        </main>
    )
}

export default Page;