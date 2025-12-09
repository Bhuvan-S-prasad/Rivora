'use client'

import { sidebarLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Bottombar() {
    const pathname = usePathname();
    return (
        <section className="bottombar">
            <div className="bottombar_container">
                {sidebarLinks.map((link) => {
                    const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;
                    return (
                        <div>
                            <Link href={link.route}
                                key={link.label}
                                className={`bottombar_link ${isActive && 'bg-primary-500'}`}>
                                <span className="w-6 h-6">{link.icon}</span>
                                <p className="text-subtle-medium text-light-1 max-sm:hidden">{link.label.split(/\s+/)[0]}</p>
                            </Link >
                        </div >
                    )
                }
                )}
            </div>

        </section>
    )
}

export default Bottombar;