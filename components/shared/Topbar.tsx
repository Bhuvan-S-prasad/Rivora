'use client';

import { OrganizationSwitcher, SignedIn, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Topbar() {
    const pathname = usePathname();

    const getPageTitle = (path: string) => {
        if (path === '/') return 'Home';
        if (path.includes('/search')) return 'Search';
        if (path.includes('/activity')) return 'Activity';
        if (path.includes('/create-echo')) return 'Post';
        if (path.includes('/profile')) return 'Profile';
        if (path.includes('/rift')) return 'Rifts';
        return '';
    };

    const title = getPageTitle(pathname);

    return (
        <nav className="topbar">
            <Link href="/" className="flex items-center gap-4">
                <Image src="/rivora-logo.png" alt="logo" width={28} height={28} />
                <p className="text-heading3-bold text-dark-1 max-xs:hidden">Rivora</p>
            </Link>

            <div className="flex items-center gap-1">
                <h2 className="text-heading3-bold text-dark-1 hidden md:block">{title}</h2>
            </div>

            <div className="flex items-center gap-1">
                <div className="block md:hidden">
                    <SignedIn>
                        <SignOutButton>
                            <div className="flex cursor-pointer">
                                <LogOut />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>
                <OrganizationSwitcher
                    appearance={{
                        elements: {
                            organizationSwitcherTrigger: "py-2 px-4",
                        },
                    }}
                />

            </div>
        </nav>

    )
}

export default Topbar;