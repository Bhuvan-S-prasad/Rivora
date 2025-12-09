import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";


async function Page() {

    const user = await currentUser();

    if (!user) return null;

    const userData = {
        id: user?.id,
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.emailAddresses[0].emailAddress,
        image: user?.imageUrl,
    }
    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-5">
            <h1 className="head-text text-dark-1">Onboarding</h1>
            <p className="mt-3 text-base-regular text-dark-2">Complete your profile to start using Rivora</p>

            <section className="mt-10 bg-white p-10 border border-light-2 rounded-xl shadow-sm">
                <AccountProfile user={userData} btnTitle="Continue" />
            </section>
        </main>
    )
}


export default Page;