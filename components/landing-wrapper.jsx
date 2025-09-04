"use client";

import { usePathname } from "next/navigation";
import { BackgroundBeamsWithCollision } from "@/components/ui/aurora";

export default function PageWrapper({ children }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    return (
        <div className="relative flex-1">
            {isLandingPage && (
                <BackgroundBeamsWithCollision className="absolute inset-0 -z-10" />
            )}
            {children}
        </div>
    );
}
