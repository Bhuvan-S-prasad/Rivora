import { ClerkProvider, SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Inter } from "next/font/google";

export const metadata = {
    title: "Rivora",
    description: "Rivora is a game-centered social platform where communities form around individual games.",
}

const inter = Inter({
    subsets: ["latin"],
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    <header className="flex justify-end items-center p-4 gap-4 h-16">
                        <SignedOut>
                            <SignInButton />
                            <SignUpButton>
                                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </header>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}