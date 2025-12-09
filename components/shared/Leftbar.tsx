'use client'

import { sidebarLinks } from "@/constants";
import { SignedIn, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function Leftbar() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <section className="custom-scrollbar leftsidebar">
            <div className="flex w-full flex-1 flex-col gap-6 px-6">
                {sidebarLinks.map((link) => {
                    const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

                    return (
                        <div>
                            <Link href={link.route}
                                key={link.label}
                                className={`leftsidebar_link ${isActive && 'bg-primary-500'}`}>
                                <span className="w-6 h-6">{link.icon}</span>
                                <p className="text-light-1 max-xs:hidden">{link.label}</p>
                            </Link >
                        </div >
                    )
                }
                )}

            </div >

            <div className="mt-10 px-6">
                <SignedIn>
                    <SignOutButton redirectUrl="/sign-in">
                        <div className="flex cursor-pointer gap-4 p-4">
                            <LogOut />
                            <p className="text-light-1 max-xs:hidden">Logout</p>
                        </div>
                    </SignOutButton>
                </SignedIn>
            </div>
        </section >
    )
}

export default Leftbar;