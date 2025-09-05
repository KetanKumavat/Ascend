"use client";

import { usePathname } from "next/navigation";
import { BackgroundBeamsWithCollision } from "@/components/ui/aurora";

export default function PageWrapper({ children }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return (
            <div className="relative w-full">
                <BackgroundBeamsWithCollision className="fixed inset-0 w-full min-h-screen -z-10" />
                <div className="relative z-10 w-full">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {children}
        </div>
    );
}
