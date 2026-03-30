"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Lock, User, Save, Loader2, Layout, Monitor } from "lucide-react";

export default function AdminSettings() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [headerLoading, setHeaderLoading] = useState(false);

    // Profile State
    const [currentUsername, setCurrentUsername] = useState("admin@alfunun.com");
    const [newUsername, setNewUsername] = useState("admin@alfunun.com");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Site Settings State
    const [headerDesign, setHeaderDesign] = useState("1");

    useEffect(() => {
        // Fetch current header design
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.headerDesign) setHeaderDesign(String(data.headerDesign));
            })
            .catch(err => console.error(err));
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentUsername,
                    newUsername,
                    newPassword
                }),
            });
            const data = await res.json();

            if (data.success) {
                showToast("Profile updated successfully. Please login again.", "success");
                setCurrentUsername(newUsername);
                setNewPassword("");
                setConfirmPassword("");
            } else {
                showToast(data.error || "Failed to update profile", "error");
            }
        } catch (error) {
            showToast("An error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHeaderDesign = async () => {
        setHeaderLoading(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ headerDesign: Number(headerDesign) }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Website Header Updated!", "success");
            } else {
                showToast("Failed to update header", "error");
            }
        } catch (error) {
            showToast("Error saving setting", "error");
        } finally {
            setHeaderLoading(false);
        }
    };

    const headerOptions = [
        { id: "1", name: "Classic Glass (Blur)" },
        { id: "2", name: "Minimalist Light/Dark" },
        { id: "3", name: "Centered Logo" },
        { id: "4", name: "Split Navigation" },
        { id: "5", name: "Corporate Blue" },
        { id: "6", name: "Floating Island (Modern)" },
        { id: "7", name: "Sidebar (Left Panel)" },
        { id: "8", name: "Gradient Header" },
        { id: "9", name: "Mega Menu Style" },
        { id: "10", name: "Cyberpunk / Tech" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Admin Settings</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Website Settings Card */}
                <Card className="border-white/5 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-accent" />
                            Website Appearance
                        </CardTitle>
                        <CardDescription>Control how the public website looks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-zinc-300">Header Design Style</Label>
                            <Select value={headerDesign} onValueChange={setHeaderDesign}>
                                <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white">
                                    <SelectValue placeholder="Select a design" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    {headerOptions.map(opt => (
                                        <SelectItem key={opt.id} value={opt.id} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                                            {opt.id}. {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-zinc-500">
                                This will immediately affect the main navigation bar on all public pages.
                            </p>
                        </div>

                        <Button onClick={handleSaveHeaderDesign} disabled={headerLoading} variant="glow" className="w-full">
                            {headerLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Layout className="w-4 h-4 mr-2" /> Save Design</>}
                        </Button>
                    </CardContent>
                </Card>

                {/* Profile Settings Card */}
                <Card className="border-white/5 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-cyan-400" />
                            Admin Profile
                        </CardTitle>
                        <CardDescription>Update your login credentials.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Current Login Email</Label>
                                <Input
                                    value={currentUsername}
                                    onChange={(e) => setCurrentUsername(e.target.value)}
                                    className="bg-zinc-950/50"
                                />
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">New Email</Label>
                                    <Input
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="bg-zinc-950/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">New Password</Label>
                                    <Input
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="bg-zinc-950/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Confirm Password</Label>
                                    <Input
                                        type="text"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-zinc-950/50"
                                    />
                                </div>
                            </div>

                            <Button type="submit" variant="secondary" className="w-full mt-2" disabled={loading}>
                                {loading ? "Updating..." : "Update Profile"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
