import EchoCard from "@/components/cards/EchoCard";
import { fetchEchoes } from "@/lib/actions/echo.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {

  const result = await fetchEchoes(1, 30);

  const user = await currentUser();


  return (
    <div className="mt-6">
      <section className="flex flex-col">
        {result.echos.length === 0 ? (
          <p>No echos found</p>
        ) : (
          <>
            {
              result.echos.map((echo) => (
                <>
                  <EchoCard
                    key={echo._id}
                    id={echo._id}
                    currentUserId={user?.id || ""}
                    parentId={echo.parentId}
                    content={echo.text}
                    author={echo.author}
                    rift={echo.rift}
                    images={echo.images}
                    createdAt={echo.createdAt}
                    comments={echo.children}
                  />
                  <br />
                </>
              ))
            }
          </>
        )}

      </section>


    </div>
  );
}
