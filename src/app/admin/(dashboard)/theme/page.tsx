"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, Palette, RefreshCw } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function ThemeSettings() {
    const { showToast } = useToast();
    const { settings, loading } = useSiteSettings('theme');
    const [primary, setPrimary] = useState("#06b6d4");
    const [secondary, setSecondary] = useState("#6366f1");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings.theme_primary) setPrimary(settings.theme_primary);
        if (settings.theme_secondary) setSecondary(settings.theme_secondary);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    settings: {
                        theme_primary: primary,
                        theme_secondary: secondary
                    },
                    section: 'theme'
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Theme updated. Reload page to see fully applied changes.", "success");
                // Force reload after delay to ensure CSS variables re-calc properly if highly dynamic
                // setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast("Failed to update theme", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        } finally {
            setSaving(false);
        }
    };

    const resetDefaults = () => {
        setPrimary("#06b6d4"); // Cyan
        setSecondary("#6366f1"); // Indigo
    };

    if (loading) return <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <Palette className="w-8 h-8 text-cyan-500" />
                <div>
                    <h1 className="text-3xl font-bold text-white">Theme & Design</h1>
                    <p className="text-zinc-400">Manage your website's global color scheme.</p>
                </div>
            </div>

            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-400" /> Global Colors
                    </CardTitle>
                    <CardDescription>
                        These colors will be applied across the entire website (buttons, gradients, highlights).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Color */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-300">Primary Color (Brand)</label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-lg shadow-lg border border-white/10"
                                    style={{ backgroundColor: primary }}
                                />
                                <div className="space-y-2 flex-1">
                                    <Input
                                        type="color"
                                        value={primary}
                                        onChange={(e) => setPrimary(e.target.value)}
                                        className="h-10 w-full bg-zinc-950/50 cursor-pointer p-1"
                                    />
                                    <Input
                                        type="text"
                                        value={primary}
                                        onChange={(e) => setPrimary(e.target.value)}
                                        className="bg-zinc-950/50 font-mono text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">Used for main buttons, highlights, and headers.</p>
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-300">Secondary Color (Accent)</label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-lg shadow-lg border border-white/10"
                                    style={{ backgroundColor: secondary }}
                                />
                                <div className="space-y-2 flex-1">
                                    <Input
                                        type="color"
                                        value={secondary}
                                        onChange={(e) => setSecondary(e.target.value)}
                                        className="h-10 w-full bg-zinc-950/50 cursor-pointer p-1"
                                    />
                                    <Input
                                        type="text"
                                        value={secondary}
                                        onChange={(e) => setSecondary(e.target.value)}
                                        className="bg-zinc-950/50 font-mono text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">Used for gradients, badges, and secondary actions.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <Button onClick={handleSave} disabled={saving} variant="glow" className="w-full md:w-auto">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Theme
                        </Button>
                        <Button onClick={resetDefaults} variant="outline" className="border-white/10 hover:bg-white/5">
                            <RefreshCw className="mr-2 h-4 w-4" /> Reset to Default
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="border-white/5 bg-zinc-900/50 opacity-80 pointer-events-none">
                <CardHeader>
                    <CardTitle>Live Preview (Static)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-6 rounded-xl border border-white/10 bg-zinc-950 relative overflow-hidden text-center space-y-4">
                        <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}></div>
                        <h3 className="text-2xl font-bold text-white">Theme Preview</h3>
                        <p className="text-zinc-400">This is how your colors might look.</p>
                        <div className="flex justify-center gap-2">
                            <button className="px-4 py-2 rounded-md font-medium text-white shadow-lg shadow-cyan-500/20" style={{ backgroundColor: primary }}>Primary Button</button>
                            <button className="px-4 py-2 rounded-md font-medium text-white shadow-lg" style={{ backgroundColor: secondary }}>Secondary Button</button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
