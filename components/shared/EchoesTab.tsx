import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import EchoCard from "../cards/EchoCard";
import { fetchRiftPosts } from "@/lib/actions/rift.actions";


interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const EchoesTab = async ({
    currentUserId,
    accountId,
    accountType,
    tabType = "echos" // Default to echos
}: Props & { tabType?: string }) => {

    let result: any;


    if (accountType === 'Rift') {
        result = await fetchRiftPosts(accountId);
    }
    else {
        result = await fetchUserPosts(accountId);
    }

    if (!result) redirect('/');

    // Filter echoes based on tab type
    const echoesToRender = (result.echos || []).filter((echo: any) => {
        if (tabType === 'echos') {
            // Show top-level posts (no parentId)
            return !echo.parentId;
        } else if (tabType === 'replies') {
            // Show replies (has parentId)
            return echo.parentId;
        }
        return true;
    });

    return (
        <section className="mt-9 flex flex-col gap-10">
            {echoesToRender.map((echo: any) => (
                <EchoCard
                    key={echo._id}
                    id={echo._id}
                    currentUserId={currentUserId}
                    parentId={echo.parentId}
                    content={echo.text}
                    author={accountType === "User"
                        ? { name: result.name, image: result.image, id: result.id }
                        : { name: echo.author?.name || "Unknown", image: echo.author?.image || "", id: echo.author?.id || echo.author?._id || "" }}
                    rift={echo.rift}
                    images={echo.images}
                    likes={echo.likes ? echo.likes : []}
                    createdAt={echo.createdAt}
                    comments={echo.children}
                />
            ))}

        </section>
    )

}

export default EchoesTab;