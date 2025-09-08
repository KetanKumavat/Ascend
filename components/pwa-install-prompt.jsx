"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandaloneMode = window.navigator.standalone;

        if (isIOS && !isInStandaloneMode) {
            setTimeout(() => setShowPrompt(true), 2000);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert();
            return;
        }

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
        } else {
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    if (!showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg animate-in slide-in-from-bottom-2">
            <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">
                        Install Ascend
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                        Get quick access to your projects and meetings. Install
                    </p>
                    <div className="flex gap-2 mt-3">
                        <Button
                            onClick={handleInstallClick}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5"
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
                <button
                    onClick={handleDismiss}
                    className="text-zinc-400 hover:text-white flex-shrink-0"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
