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
            <div className="bg-white mt-8 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm p-1">
                <div className="flex gap-1">
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
                                    className="flex-1"
                                >
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full",
                                            isActive
                                                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                        )}
                                    >
                                        {IconComponent && (
                                            <IconComponent className="w-4 h-4 mr-2" />
                                        )}
                                        <span className="hidden sm:inline">
                                            {item.fullLabel || item.label}
                                        </span>
                                        <span className="sm:hidden">
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
                                    className={cn(
                                        "flex-1",
                                        isActive
                                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                    )}
                                >
                                    {IconComponent && (
                                        <IconComponent className="w-4 h-4 mr-2" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {item.fullLabel || item.label}
                                    </span>
                                    <span className="sm:hidden">
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
                <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                    {ContextIconComponent && (
                        <ContextIconComponent className="w-4 h-4" />
                    )}
                    <span>
                        {contextLabel}{" "}
                        {contextDescription && `• ${contextDescription}`}
                    </span>
                </div>
            )}
        </div>
    );
}
