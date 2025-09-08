"use client";
import { useEffect } from "react";

export default function ServiceWorkerProvider() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((registration) => {
                        console.log("Service Worker registered:", registration);
                    })
                    .catch((err) => {
                        console.error(
                            "Service Worker registration failed:",
                            err
                        );
                    });
            });
        }
    }, []);

    return null;
}
