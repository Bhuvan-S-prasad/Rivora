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

                        </header>
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    )
}