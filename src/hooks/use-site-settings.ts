import { useState, useEffect } from "react";
import { SiteSettings } from "@/lib/types";

export function useSiteSettings(section?: string) {
    const [settings, setSettings] = useState<SiteSettings>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const url = section ? `/api/content?section=${section}` : "/api/content";
                const res = await fetch(url);
                const data = await res.json();
                if (data.success) {
                    setSettings(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [section]);

    return { settings, loading };
}
