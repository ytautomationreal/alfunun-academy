"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, LayoutTemplate, Phone, MapPin, Mail, Trophy, Users, Briefcase, GraduationCap, FileText, MessageCircle } from "lucide-react";
import { SiteSettings } from "@/lib/types";

export default function ContentManagement() {
    const { showToast } = useToast();
    const [settings, setSettings] = useState<SiteSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/content");
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

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (section: string) => {
        setSaving(true);
        // Filter settings that belong to this section to minimize payload (optional, but cleaner)
        // For simplicity, we send specific keys related to valid inputs

        let payload: SiteSettings = {};
        if (section === 'hero') {
            payload = {
                hero_title: settings.hero_title,
                hero_subtitle: settings.hero_subtitle,
                hero_admission_banner: settings.hero_admission_banner,
                hero_show_spotlight: settings.hero_show_spotlight,
                hero_particle_count: settings.hero_particle_count,
                hero_particle_size: settings.hero_particle_size,
                hero_interaction_mode: settings.hero_interaction_mode,
                hero_interaction_strength: settings.hero_interaction_strength
            };
        } else if (section === 'contact') {
            payload = { contact_phone: settings.contact_phone, contact_email: settings.contact_email, contact_address: settings.contact_address };
        } else if (section === 'stats') {
            payload = {
                stats_students: settings.stats_students,
                stats_mentors: settings.stats_mentors,
                stats_job_success: settings.stats_job_success,
                stats_batches: settings.stats_batches
            };
        } else if (section === 'footer') {
            payload = { footer_copyright: settings.footer_copyright };
        } else if (section === 'header') {
            payload = { header_whatsapp: settings.header_whatsapp };
        }

        try {
            const res = await fetch("/api/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: payload, section }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Settings updated successfully", "success");
            } else {
                showToast("Failed to update settings", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <LayoutTemplate className="w-8 h-8 text-cyan-500" />
                <div>
                    <h1 className="text-3xl font-bold text-white">Site Content</h1>
                    <p className="text-zinc-400">Manage your website's text and contact information.</p>
                </div>
            </div>

            {/* Hero Section */}
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-400" /> Hero Section (Home)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Admission Banner Text</label>
                        <Input
                            value={settings.hero_admission_banner || ""}
                            onChange={(e) => handleChange('hero_admission_banner', e.target.value)}
                            placeholder="Accepting New Admissions for 2025"
                            className="bg-zinc-950/50"
                        />
                        <p className="text-xs text-zinc-500">This text appears in the animated banner above the main title.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Hero Main Title</label>
                        <Input
                            value={settings.hero_title || ""}
                            onChange={(e) => handleChange('hero_title', e.target.value)}
                            className="bg-zinc-950/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Hero Subtitle</label>
                        <textarea
                            value={settings.hero_subtitle || ""}
                            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Visual Settings */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <h3 className="text-sm font-semibold text-white">Visual Effects</h3>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-zinc-950/30">
                            <label className="text-sm font-medium text-zinc-300">Enable Spotlight (White Shadow)</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handleChange('hero_show_spotlight', 'true')}
                                    variant={settings.hero_show_spotlight === 'true' ? "default" : "outline"}
                                    size="sm"
                                    className="h-8"
                                >
                                    On
                                </Button>
                                <Button
                                    onClick={() => handleChange('hero_show_spotlight', 'false')}
                                    variant={settings.hero_show_spotlight !== 'true' ? "default" : "outline"}
                                    size="sm"
                                    className="h-8"
                                >
                                    Off
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Particle Count (Density)</label>
                                <Input
                                    type="number"
                                    value={settings.hero_particle_count || "120"}
                                    onChange={(e) => handleChange('hero_particle_count', e.target.value)}
                                    className="bg-zinc-950/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Particle Size (Dots)</label>
                                <Input
                                    type="number"
                                    value={settings.hero_particle_size || "2"}
                                    onChange={(e) => handleChange('hero_particle_size', e.target.value)}
                                    className="bg-zinc-950/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Repel/Interact Speed (1-10)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    max="10"
                                    value={settings.hero_interaction_strength || "1.0"}
                                    onChange={(e) => handleChange('hero_interaction_strength', e.target.value)}
                                    className="bg-zinc-950/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Mouse Interaction Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['connect', 'repel', 'none'].map((mode) => (
                                    <Button
                                        key={mode}
                                        onClick={() => handleChange('hero_interaction_mode', mode)}
                                        variant={settings.hero_interaction_mode === mode ? "glow" : "outline"}
                                        className="capitalize"
                                        size="sm"
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => handleSave('hero')} disabled={saving} variant="glow" className="w-full md:w-auto">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Hero Settings
                    </Button>
                </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-400" /> Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</label>
                            <Input value={settings.contact_phone || ""} onChange={(e) => handleChange('contact_phone', e.target.value)} className="bg-zinc-950/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                            <Input value={settings.contact_email || ""} onChange={(e) => handleChange('contact_email', e.target.value)} className="bg-zinc-950/50" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><MapPin className="w-3 h-3" /> Address</label>
                        <Input value={settings.contact_address || ""} onChange={(e) => handleChange('contact_address', e.target.value)} className="bg-zinc-950/50" />
                    </div>
                    <Button onClick={() => handleSave('contact')} disabled={saving} variant="glow" className="w-full md:w-auto">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Contact Info
                    </Button>
                </CardContent>
            </Card>

            {/* Stats Section */}
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" /> Statistics (Why Choose Us)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Users className="w-3 h-3" /> Students Enrolled</label>
                            <Input value={settings.stats_students || ""} onChange={(e) => handleChange('stats_students', e.target.value)} className="bg-zinc-950/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Expert Mentors</label>
                            <Input value={settings.stats_mentors || ""} onChange={(e) => handleChange('stats_mentors', e.target.value)} className="bg-zinc-950/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Trophy className="w-3 h-3" /> Job Success Rate</label>
                            <Input value={settings.stats_job_success || ""} onChange={(e) => handleChange('stats_job_success', e.target.value)} className="bg-zinc-950/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><GraduationCap className="w-3 h-3" /> Active Batches</label>
                            <Input value={settings.stats_batches || ""} onChange={(e) => handleChange('stats_batches', e.target.value)} className="bg-zinc-950/50" />
                        </div>
                    </div>
                    <Button onClick={() => handleSave('stats')} disabled={saving} variant="glow" className="w-full md:w-auto">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Stats
                    </Button>
                </CardContent>
            </Card>

            {/* Footer Section */}
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" /> Footer Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Copyright Text</label>
                        <Input
                            value={settings.footer_copyright || ""}
                            onChange={(e) => handleChange('footer_copyright', e.target.value)}
                            placeholder="© 2025 Alfunun Computer Academy. All rights reserved."
                            className="bg-zinc-950/50"
                        />
                        <p className="text-xs text-zinc-500">This text appears at the bottom of every page.</p>
                    </div>
                    <Button onClick={() => handleSave('footer')} disabled={saving} variant="glow" className="w-full md:w-auto">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Footer
                    </Button>
                </CardContent>
            </Card>

            {/* Header Settings */}
            <Card className="border-white/5 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-400" /> Header Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">WhatsApp Number (for Chat Button)</label>
                        <Input
                            value={settings.header_whatsapp || ""}
                            onChange={(e) => handleChange('header_whatsapp', e.target.value)}
                            placeholder="923001234567"
                            className="bg-zinc-950/50"
                        />
                        <p className="text-xs text-zinc-500">Enter number without + or spaces (e.g., 923001234567). This will be used for the "Chat With Us" button.</p>
                    </div>
                    <Button onClick={() => handleSave('header')} disabled={saving} variant="glow" className="w-full md:w-auto">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Header
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
