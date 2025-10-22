"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
    const INITIAL_DELAY = 10000; // 10 seconds

    useEffect(() => {
        const dismissedUntil = localStorage.getItem(
            "pwa-install-dismissed-until"
        );
        const hasInstalled =
            localStorage.getItem("pwa-install-completed") === "true";

        if (
            (dismissedUntil && Date.now() < parseInt(dismissedUntil)) ||
            hasInstalled
        )
            return;

        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;
        if (standalone) {
            localStorage.setItem("pwa-install-completed", "true");
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShowPrompt(true), INITIAL_DELAY);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = window.navigator.standalone === true;

        if (isIOS && !isInStandaloneMode) {
            setTimeout(() => setShowPrompt(true), 15000);
        }

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert(
                'To install this app:\n\n1. Tap the Share icon\n2. Select "Add to Home Screen"\n3. Tap "Add"'
            );
            setShowPrompt(false);
            localStorage.setItem(
                "pwa-install-dismissed-until",
                Date.now() + DISMISS_DURATION
            );
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            localStorage.setItem("pwa-install-completed", "true");
        } else {
            localStorage.setItem(
                "pwa-install-dismissed-until",
                Date.now() + DISMISS_DURATION
            );
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
        localStorage.setItem(
            "pwa-install-dismissed-until",
            Date.now() + DISMISS_DURATION
        );
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-2 md:bottom-4 right-2 w-[95%] sm:w-2/3 md:w-1/3 lg:w-1/4 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg animate-in slide-in-from-bottom-2">
            <div className="relative flex flex-col sm:flex-row sm:items-start gap-3">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>

                <Download className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />

                <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">
                        Install Ascend
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                        Get quick access to your projects and meetings. Install
                        our app for the best experience.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                            onClick={handleInstallClick}
                            size="sm"
                            className="bg-lime-500 hover:bg-lime-600 text-black font-medium text-xs px-3 py-1.5"
                        >
                            Install
                        </Button>
                        <Button
                            onClick={handleDismiss}
                            variant="outline"
                            size="sm"
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 text-xs px-3 py-1.5"
                        >
                            Not now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
