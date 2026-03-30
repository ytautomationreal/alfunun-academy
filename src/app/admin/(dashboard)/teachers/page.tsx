"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Loader2, Users, Upload, Facebook, Twitter, Linkedin, Instagram, Youtube, Github, Settings } from "lucide-react";


import Image from "next/image";
import { Teacher } from "@/lib/types";

export default function TeachersManagement() {
    const { showToast } = useToast();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [siteSettings, setSiteSettings] = useState<{ team_image_shape: string, team_text_align: string }>({
        team_image_shape: 'rounded',
        team_text_align: 'left'
    });

    // Restoring missing state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        bio: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
        youtube: "",
        github: "",
        sort_order: 0
    });

    useEffect(() => {
        fetchTeachers();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/content?section=team");
            const data = await res.json();
            if (data.success) {
                setSiteSettings({
                    team_image_shape: data.data.team_image_shape || 'rounded',
                    team_text_align: data.data.team_text_align || 'left'
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch("/api/content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section: 'team',
                    settings: siteSettings
                }),
            });
            if (res.ok) {
                showToast("Styling preferences saved", "success");
                setIsSettingsModalOpen(false);
            } else {
                showToast("Failed to save settings", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        }
    };

    // Restored handlers
    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/teachers");
            const data = await res.json();
            if (data.success) setTeachers(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [editingId, setEditingId] = useState<number | null>(null);

    // ... (keep existing state)

    const handleEdit = (teacher: Teacher) => {
        setEditingId(teacher.id);
        setFormData({
            name: teacher.name,
            role: teacher.role,
            bio: teacher.bio || "",
            facebook: teacher.facebook || "",
            twitter: teacher.twitter || "",
            linkedin: teacher.linkedin || "",
            instagram: teacher.instagram || "",
            youtube: teacher.youtube || "",
            github: teacher.github || "",
            sort_order: teacher.sort_order || 0
        });
        setPreviewUrl(teacher.imageUrl || null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let imageUrl = previewUrl;

            // Only upload if a new file is selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    imageUrl = uploadData.url;
                }
            } else if (editingId && !imageFile) {
                // Keep existing image if editing and no new file
                const existingTeacher = teachers.find(t => t.id === editingId);
                if (existingTeacher) imageUrl = existingTeacher.imageUrl || null;
            }

            const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, imageUrl }),
            });
            const data = await res.json();

            if (data.success) {
                showToast(editingId ? "Teacher updated successfully" : "Teacher added successfully", "success");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ name: "", role: "", bio: "", facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "", github: "", sort_order: 0 });
                setImageFile(null);
                setPreviewUrl(null);
                fetchTeachers();
            } else {
                showToast(data.error || "Operation failed", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            const res = await fetch(`/api/teachers/${deletingId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Teacher deleted", "success");
                setTeachers(teachers.filter(t => t.id !== deletingId));
                setDeletingId(null);
            } else {
                showToast("Failed to delete", "error");
            }
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* ... Header ... */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Users className="w-8 h-8 text-cyan-500" /> Team & Teachers
                    </h1>
                    <p className="text-zinc-400">Manage your expert faculty members.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsSettingsModalOpen(true)} variant="outline" className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10">
                        <Settings className="mr-2 h-4 w-4" /> Style Settings
                    </Button>
                    <Button onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", role: "", bio: "", facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "", github: "", sort_order: 0 });
                        setPreviewUrl(null);
                        setIsModalOpen(true);
                    }} variant="glow">
                        <Plus className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {teachers.map((teacher) => (
                        <Card key={teacher.id} className="border-white/5 bg-zinc-900/50 hover:border-cyan-500/30 transition-all overflow-hidden group">
                            <div className={`relative bg-zinc-800 ${siteSettings.team_image_shape === 'circle' ? 'rounded-full mt-4 mx-auto w-40 h-40 border-2 border-zinc-700' : 'w-full aspect-square'}`}>
                                <Image
                                    src={teacher.imageUrl || "/placeholder-user.jpg"}
                                    alt={teacher.name}
                                    fill
                                    className={`object-cover ${siteSettings.team_image_shape === 'circle' ? 'rounded-full' : ''}`}
                                />
                                {siteSettings.team_image_shape !== 'circle' && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                )}

                                {/* ACTION BUTTONS */}
                                <div className="absolute top-2 right-2 flex gap-2 z-10">
                                    <button
                                        onClick={() => handleEdit(teacher)}
                                        className="p-2 bg-black/60 rounded-full text-white hover:bg-cyan-500 transition-all border border-white/10"
                                        title="Edit"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(teacher.id)}
                                        className="p-2 bg-black/60 rounded-full text-white hover:bg-red-500 transition-all border border-white/10"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <CardContent className={`p-4 relative ${siteSettings.team_text_align === 'center' ? 'text-center' : 'text-left'}`}>
                                <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
                                <p className="text-cyan-400 text-sm mb-2">{teacher.role}</p>
                                <div className={`flex gap-3 mt-2 ${siteSettings.team_text_align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                    {teacher.facebook && <Facebook className="w-4 h-4 text-zinc-500 hover:text-cyan-400 cursor-pointer" />}
                                    {teacher.twitter && <Twitter className="w-4 h-4 text-zinc-500 hover:text-cyan-400 cursor-pointer" />}
                                    {teacher.linkedin && <Linkedin className="w-4 h-4 text-zinc-500 hover:text-cyan-400 cursor-pointer" />}
                                    {teacher.instagram && <Instagram className="w-4 h-4 text-zinc-500 hover:text-cyan-400 cursor-pointer" />}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Team Member" : "Add New Team Member"}
            >
                {/* ... (rest of the form is mostly same, just checking submit handler) ... */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... Same Inputs ... */}
                    <div className="flex justify-center mb-4">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-600 hover:border-cyan-500 transition-colors group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-cyan-500">
                                    <Upload className="w-8 h-8 mb-1" />
                                    <span className="text-xs">Upload Photo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Name</label>
                            <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-950/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Role</label>
                            <Input required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="bg-zinc-950/50" placeholder="e.g. Senior Instructor" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Sort Order</label>
                        <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="bg-zinc-950/50" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Bio (Short)</label>
                        <Input value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="bg-zinc-950/50" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Facebook</label>
                            <Input value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} className="bg-zinc-950/50 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Twitter</label>
                            <Input value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} className="bg-zinc-950/50 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">LinkedIn</label>
                            <Input value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="bg-zinc-950/50 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Instagram</label>
                            <Input value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="bg-zinc-950/50 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">YouTube</label>
                            <Input value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} className="bg-zinc-950/50 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">GitHub</label>
                            <Input value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className="bg-zinc-950/50 text-xs" />
                        </div>
                    </div>

                    <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingId ? "Update Member" : "Add Member")}
                    </Button>
                </form>
            </Modal>


            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Confirm Removal"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Are you sure?</h3>
                        <p className="text-zinc-400 text-sm">Do you really want to remove this team member? This action cannot be undone.</p>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                        <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Remove Member</Button>
                    </div>
                </div>
            </Modal>

            {/* Styling Settings Modal */}
            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="Customize Team Section"
            >
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white block">Image Shape</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setSiteSettings(prev => ({ ...prev, team_image_shape: 'square' }))}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${siteSettings.team_image_shape === 'square' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}
                            >
                                <div className="w-8 h-8 bg-current rounded-none" />
                                <span className="text-xs">Square</span>
                            </button>
                            <button
                                onClick={() => setSiteSettings(prev => ({ ...prev, team_image_shape: 'rounded' }))}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${siteSettings.team_image_shape === 'rounded' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}
                            >
                                <div className="w-8 h-8 bg-current rounded-xl" />
                                <span className="text-xs">Rounded</span>
                            </button>
                            <button
                                onClick={() => setSiteSettings(prev => ({ ...prev, team_image_shape: 'circle' }))}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${siteSettings.team_image_shape === 'circle' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}
                            >
                                <div className="w-8 h-8 bg-current rounded-full" />
                                <span className="text-xs">Circle</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white block">Text Alignment</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSiteSettings(prev => ({ ...prev, team_text_align: 'left' }))}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${siteSettings.team_text_align === 'left' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}
                            >
                                <div className="space-y-1 w-full flex flex-col items-start px-4">
                                    <div className="w-3/4 h-1 bg-current rounded-full" />
                                    <div className="w-1/2 h-1 bg-current rounded-full" />
                                </div>
                                <span className="text-xs">Left Align</span>
                            </button>
                            <button
                                onClick={() => setSiteSettings(prev => ({ ...prev, team_text_align: 'center' }))}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${siteSettings.team_text_align === 'center' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}
                            >
                                <div className="space-y-1 w-full flex flex-col items-center px-4">
                                    <div className="w-3/4 h-1 bg-current rounded-full" />
                                    <div className="w-1/2 h-1 bg-current rounded-full" />
                                </div>
                                <span className="text-xs">Center Align</span>
                            </button>
                        </div>
                    </div>

                    <Button onClick={handleSaveSettings} variant="glow" className="w-full">
                        Save Preferences
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
