import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderIcon, VideoIcon, Book } from "lucide-react";

export default function ProjectNavigation({
    projectId,
    currentPage = "overview",
}) {
    const navItems = [
        {
            id: "overview",
            label: "Overview",
            href: `/project/${projectId}`,
            icon: FolderIcon,
        },
        {
            id: "meetings",
            label: "Meetings",
            href: `/project/${projectId}/meetings`,
            icon: VideoIcon,
        },
        {
            id: "canvas",
            label: "Canvas",
            href: `/project/${projectId}/canvas`,
            icon: Book,
        },
    ];

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <Link key={item.id} href={item.href}>
                            <Button
                                variant="ghost"
                                className={`rounded-none ${
                                    isActive
                                        ? "border-b-2 border-lime-500 text-lime-600"
                                        : "hover:border-b-2 hover:border-lime-500"
                                }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
