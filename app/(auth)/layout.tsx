import { ClerkProvider, SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import '../globals.css'


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
                    <div className="w-full flex justify-center items-center min-h-screen">
                        <header className="flex justify-center items-center p-4 gap-4 h-16">
                            <SignedOut>
                                <SignInButton />
                                <SignUpButton>
                                    <button className="bg-[#07aafc] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                        Sign Up
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </header>
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    )
}