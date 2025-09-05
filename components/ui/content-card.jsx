import { cn } from "@/lib/utils";

export function ContentCard({ 
    title, 
    description, 
    icon: Icon, 
    children, 
    className,
    headerClassName,
    bodyClassName 
}) {
    return (
        <div className={cn(
            "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm",
            className
        )}>
            {(title || description || Icon) && (
                <div className={cn(
                    "p-6 border-b border-neutral-200 dark:border-neutral-800",
                    headerClassName
                )}>
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />}
                        {title && (
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {title}
                            </h2>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className={cn("p-6", bodyClassName)}>
                {children}
            </div>
        </div>
    );
}
