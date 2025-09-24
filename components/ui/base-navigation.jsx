"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FolderIcon, VideoIcon, Book, BarChart3, Target } from "lucide-react";

const iconMap = {
    FolderIcon: FolderIcon,
    VideoIcon: VideoIcon,
    Book: Book,
    BarChart3: BarChart3,
    Target: Target,
};

export function BaseNavigation({
    items,
    activeItem,
    className,
    contextLabel,
    contextIcon,
    contextDescription,
}) {
    const ContextIconComponent =
        typeof contextIcon === "string" ? iconMap[contextIcon] : contextIcon;

    return (
        <div className={cn("mb-8", className)}>
            <div className="mt-8 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm p-1 overflow-hidden">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {items.map((item) => {
                        const IconComponent =
                            typeof item.icon === "string"
                                ? iconMap[item.icon]
                                : item.icon;
                        const isActive = activeItem === item.key;

                        if (item.href) {
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className="flex-1 min-w-0"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "w-full h-9 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap",
                                            isActive
                                                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                        )}
                                    >
                                        {IconComponent && (
                                            <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                        )}
                                        <span className="hidden md:inline truncate">
                                            {item.fullLabel || item.label}
                                        </span>
                                        <span className="md:hidden truncate text-xs">
                                            {item.label}
                                        </span>
                                    </Button>
                                </Link>
                            );
                        } else {
                            return (
                                <Button
                                    key={item.key}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "flex-1 min-w-0 h-9 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap",
                                        isActive
                                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                    )}
                                >
                                    {IconComponent && (
                                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                    )}
                                    <span className="hidden md:inline truncate">
                                        {item.fullLabel || item.label}
                                    </span>
                                    <span className="md:hidden truncate text-xs">
                                        {item.label}
                                    </span>
                                </Button>
                            );
                        }
                    })}
                </div>
            </div>

            {/* Context indicator */}
            {contextLabel && (
                <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3 px-1">
                    {ContextIconComponent && (
                        <ContextIconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    )}
                    <span className="truncate">
                        {contextLabel}{" "}
                        {contextDescription && (
                            <span className="hidden sm:inline">• {contextDescription}</span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}
