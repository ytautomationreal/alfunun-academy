"use client";

import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/hooks/use-site-settings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { settings, loading } = useSiteSettings('theme');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (settings.theme_primary) {
            document.documentElement.style.setProperty('--primary', settings.theme_primary);
            // Simple logic for foreground: always white for now
            document.documentElement.style.setProperty('--primary-foreground', '#ffffff');
        } else if (!loading) {
            // Default Cyan
            document.documentElement.style.setProperty('--primary', '#06b6d4');
            document.documentElement.style.setProperty('--primary-foreground', '#ffffff');
        }

        if (settings.theme_secondary) {
            document.documentElement.style.setProperty('--secondary', settings.theme_secondary);
            document.documentElement.style.setProperty('--secondary-foreground', '#ffffff');
        } else if (!loading) {
            // Default Indigo
            document.documentElement.style.setProperty('--secondary', '#6366f1');
            document.documentElement.style.setProperty('--secondary-foreground', '#ffffff');
        }
    }, [settings, loading]);

    // Prevent hydration mismatch by rendering children only after mount (optional, 
    // but here we just want to inject styles. The children can render immediately).
    // The visual flash might happen but it's acceptable for now.

    return <>{children}</>;
}
