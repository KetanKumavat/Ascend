"use client";

import dynamic from "next/dynamic";

// Client-side dynamic import wrapper for Excalidraw
const ExcalidrawWrapper = dynamic(
    async () => (await import("./excalidraw-wrapper")).default,
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Loading Canvas...</p>
                </div>
            </div>
        ),
    }
);

export default function ClientExcalidrawWrapper(props) {
    return <ExcalidrawWrapper {...props} />;
}
