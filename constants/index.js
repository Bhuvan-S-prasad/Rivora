import { Heart, HomeIcon, MessageCirclePlusIcon, SearchIcon, UserRound, UsersIcon } from "lucide-react";

export const sidebarLinks = [
    {
        icon: <HomeIcon />,
        route: "/",
        label: "Home"
    },
    {
        icon: <SearchIcon />,
        route: "/search",
        label: "Search"
    },
    {
        icon: <Heart />,
        route: "/activity",
        label: "Activity"
    },
    {
        icon: <MessageCirclePlusIcon />,
        route: "/create-echo",
        label: "Create Echo",
    },
    {
        icon: <UsersIcon />,
        route: "/rifts",
        label: "Rifts"
    },
    {
        icon: <UserRound />,
        route: "/profile",
        label: "Profile"
    }
]