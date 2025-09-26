"use client";

import { useEffect, useState } from "react";
import LightRays from "./LightRays";

export default function ScrollHeader({ children }) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ease-in-out bg-transparent ${
                isVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
            }`}
            style={{
                pointerEvents: isVisible ? "auto" : "none",
            }}
        >
            {children}
        </div>
    );
}
