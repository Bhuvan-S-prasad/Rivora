import EchoCard from "@/components/cards/EchoCard";
import PostEcho from "@/components/forms/PostEcho";
import { fetchEchoes } from "@/lib/actions/echo.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {

  const result = await fetchEchoes(1, 30);

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <div className="flex flex-col">
      <div className="bg-white rounded-t-2xl border-x border-t border-b-0 border-gray-200 overflow-hidden">
        <PostEcho userId={userInfo._id.toString()} name={userInfo.name} username={userInfo.username} userImage={userInfo.image} />

        <section className="flex flex-col">
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
          )}

        </section>
      </div>
    </div>
  );
}
