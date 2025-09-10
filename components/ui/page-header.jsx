import React from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

const PageHeader = ({
    title,
    subtitle,
    backHref,
    backLabel = "Back",
    children,
    className = "",
}) => {
    return (
        <div className="relative">
            {/* Background gradient */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 pointer-events-none" />

            {/* Subtle grid pattern */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(163_163_163/0.15)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(115_115_115/0.15)_1px,transparent_0)] pointer-events-none" /> */}

            <div
                className={`relative pt-28 pb-8 px-4 sm:px-6 lg:px-8 ${className}`}
            >
                <div className="max-w-7xl mx-auto">
                    {/* Back navigation */}
                    {backHref && (
                        <div className="mb-6">
                            <Link href={backHref}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    {backLabel}
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Header content */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Action buttons or additional content */}
                        {children && (
                            <div className="flex-shrink-0">{children}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
