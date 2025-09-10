"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BaseNavigation } from "@/components/ui/base-navigation";
import {
    ArrowLeft,
    Home,
    FolderIcon,
    VideoIcon,
    Book,
    ChevronRight,
} from "lucide-react";

const iconMap = {
    Home: Home,
    FolderIcon: FolderIcon,
    VideoIcon: VideoIcon,
    Book: Book,
    ArrowLeft: ArrowLeft,
    ChevronRight: ChevronRight,
};

export default function EnhancedPageHeader({
    title,
    subtitle,
    backHref,
    breadcrumb = [],
    projectNavigation = null, // { projectId, currentPage, items }
}) {
    const router = useRouter();

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <div className="relative">
            {/* Background gradient - matching dashboard */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

                {/* Subtle grid pattern - matching dashboard */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" />  */}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                {/* Main Header Section */}
                <div className="flex items-center justify-between pt-28 pb-4">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="flex-shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>

                        {/* Breadcrumb Navigation */}
                        <nav className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 min-w-0 flex-1">
                            {breadcrumb.map((item, index) => {
                                const IconComponent = iconMap[item.icon];
                                const isLast = index === breadcrumb.length - 1;

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2 min-w-0"
                                    >
                                        {item.href ? (
                                            <Link
                                                href={item.href}
                                                className="flex items-center space-x-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors truncate"
                                                prefetch={true}
                                            >
                                                {IconComponent && (
                                                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                                                )}
                                                <span className="truncate">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center space-x-1 truncate">
                                                {IconComponent && (
                                                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                                                )}
                                                <span
                                                    className={`truncate ${
                                                        isLast
                                                            ? "text-neutral-900 dark:text-neutral-100 font-medium"
                                                            : ""
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>
                                        )}
                                        {!isLast && (
                                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Title and Subtitle */}
                <div className="pb-6">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Project Navigation */}
            {projectNavigation && (
                <div className="relative border-t border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <BaseNavigation
                            items={projectNavigation.items}
                            activeItem={projectNavigation.currentPage}
                            contextLabel="Project-level view"
                            contextIcon="Target"
                            contextDescription="Focused on this specific project"
                            className="mb-0 pt-4"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
