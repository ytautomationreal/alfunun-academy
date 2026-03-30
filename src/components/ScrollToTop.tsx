"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);

        // Disable browser's default scroll restoration
        if (typeof window !== "undefined" && window.history) {
            window.history.scrollRestoration = "manual";
        }

        // Optional: Re-enable auto restoration on unmount if needed, 
        // but usually 'manual' is fine for SPA-like feel or strictly top-on-load.
        return () => {
            if (typeof window !== "undefined" && window.history) {
                window.history.scrollRestoration = "auto";
            }
        };
    }, []);

    return null;
}
