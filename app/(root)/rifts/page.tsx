import RiftCard from "@/components/cards/RiftCard";
import { fetchRifts } from "@/lib/actions/rift.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const resolvedSearchParams = await searchParams;

    const result = await fetchRifts({
        searchString: resolvedSearchParams.q || "",
        pageNumber: resolvedSearchParams?.page ? +resolvedSearchParams.page : 1,
        pageSize: 20,
    });

    return (
        <div className="flex flex-col">
            <div className="bg-white rounded-t-2xl border-x border-t border-b-0 border-gray-200 overflow-hidden">
                {result.rifts.length === 0 ? (
                    <p className="no-result p-4">No rifts found</p>
                ) : (
                    <>
                        {result.rifts.map((rift: any) => (
                            <Link href={`/rifts/${rift.id}`} key={rift.id}>
                                <RiftCard
                                    id={rift.id}
                                    name={rift.name}
                                    username={rift.username}
                                    image={rift.image}
                                    bio={rift.bio}
                                    members={rift.members}
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
