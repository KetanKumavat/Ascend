import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                hero: "bg-gradient-to-r from-lime-500 to-lime-400 text-black font-semibold px-8 py-4 text-base rounded-full hover:from-lime-400 hover:to-lime-300 transition-all duration-300 glow-lime hover:scale-105 transform",
                ghost: "text-neutral-300 hover:text-lime-400 hover:bg-surface/50 transition-all duration-300",
                outline:
                    "border border-neutral-700 bg-transparent text-neutral-200 hover:border-lime-500/50 hover:text-lime-400 hover:bg-lime-500/5 transition-all duration-300",
                glow: "bg-transparent border border-lime-500/30 text-lime-400 hover:border-lime-400 hover:bg-lime-500/10 transition-all duration-300 hover:glow-soft",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                xl: "h-12 rounded-lg px-10 text-lg",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const GradientButton = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
GradientButton.displayName = "GradientButton";

export { GradientButton, buttonVariants };
