import { GitPullRequestClosed, Heart, HomeIcon, MessageCirclePlusIcon, SearchIcon, Tag, UserRound, Users, UsersIcon } from "lucide-react";

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

export const profileTabs = [
    { value: "echos", label: "Echos", icon: <MessageCirclePlusIcon /> },
    { value: "replies", label: "Replies", icon: <Users /> },
    { value: "tagged", label: "Tagged", icon: <Tag /> },
];

export const riftTabs = [
    { value: "echos", label: "Echos", icon: <MessageCirclePlusIcon /> },
    { value: "members", label: "Members", icon: <Users /> },
    { value: "requests", label: "Requests", icon: <GitPullRequestClosed /> },
]