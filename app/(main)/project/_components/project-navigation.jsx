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
        <nav className="border-b border-neutral-200 dark:border-neutral-800 mb-6 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1 items-center py-3 min-w-max">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;

                            return (
                                <Link key={item.id} href={item.href} className="shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`rounded-lg border-0 px-3 py-2 h-9 transition-all duration-200 ${
                                            isActive
                                                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        <span className="hidden xs:inline font-medium text-sm">
                                            {item.label}
                                        </span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
