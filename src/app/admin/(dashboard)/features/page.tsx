"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Loader2, LayoutGrid, Award, Monitor, Wifi, Users, Clock, Droplets, Laptop, Shield, Edit, Projector, Presentation, BookOpen, Headphones, Printer, Camera, Video, Globe, Zap, Coffee, AirVent, Lightbulb, GraduationCap, MousePointer2, Keyboard, Server, Database, Code, Palette, PenTool, FileText, Settings, Target, Rocket, Star, Heart, ThumbsUp, Building, MapPin } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { Feature } from "@/lib/types";

const ICONS = [
    // Digital Academy Core
    { value: "Projector", label: "Projector (Multimedia)" },
    { value: "Presentation", label: "Presentation/Screen" },
    { value: "Monitor", label: "Monitor" },
    { value: "Laptop", label: "Laptop" },
    { value: "Keyboard", label: "Keyboard" },
    { value: "MousePointer2", label: "Mouse" },
    { value: "Server", label: "Server" },
    { value: "Database", label: "Database" },

    // Connectivity & Tech
    { value: "Wifi", label: "Wifi / Internet" },
    { value: "Globe", label: "Globe / Web" },
    { value: "Zap", label: "Zap / Power" },
    { value: "Headphones", label: "Headphones / Audio" },
    { value: "Video", label: "Video / Recording" },
    { value: "Camera", label: "Camera" },
    { value: "Printer", label: "Printer" },

    // Learning & Education
    { value: "BookOpen", label: "Book / Library" },
    { value: "GraduationCap", label: "Graduation Cap" },
    { value: "Code", label: "Code / Programming" },
    { value: "Palette", label: "Palette / Design" },
    { value: "PenTool", label: "Pen Tool / Graphics" },
    { value: "FileText", label: "Document / Notes" },

    // People & Support
    { value: "Users", label: "Users / Team" },
    { value: "Award", label: "Award / Certificate" },
    { value: "Shield", label: "Shield / Security" },
    { value: "Target", label: "Target / Goals" },
    { value: "Rocket", label: "Rocket / Growth" },
    { value: "Star", label: "Star / Quality" },
    { value: "ThumbsUp", label: "Thumbs Up" },
    { value: "Heart", label: "Heart / Care" },

    // Facility & Environment
    { value: "Clock", label: "Clock / Timing" },
    { value: "Droplets", label: "Droplets (Water)" },
    { value: "Coffee", label: "Coffee / Cafeteria" },
    { value: "AirVent", label: "AC / Air Conditioning" },
    { value: "Lightbulb", label: "Lightbulb / Ideas" },
    { value: "Building", label: "Building / Campus" },
    { value: "MapPin", label: "Location" },
    { value: "Settings", label: "Settings / Tools" },
];

const COL_SPANS = [
    { value: "md:col-span-1", label: "1 Column (Small)" },
    { value: "md:col-span-2", label: "2 Columns (Medium)" },
    { value: "md:col-span-3", label: "3 Columns (Full Width)" },
];

// Helper to render icon by string name
const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = {
        Monitor, Wifi, Award, Users, Clock, Droplets, Laptop, Shield,
        Projector, Presentation, BookOpen, Headphones, Printer, Camera, Video, Globe, Zap, Coffee, AirVent, Lightbulb, GraduationCap,
        MousePointer2, Keyboard, Server, Database, Code, Palette, PenTool, FileText, Settings, Target, Rocket, Star, Heart, ThumbsUp, Building, MapPin
    };
    const Icon = icons[name] || Monitor;
    return <Icon className={className} />;
};

export default function FeaturesManagement() {
    const { showToast } = useToast();
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Filter out id for new feature creation
    const [formData, setFormData] = useState<Omit<Feature, "id">>({
        title: "",
        description: "",
        icon: "Monitor",
        col_span: "md:col-span-1",
        bg_class: "bg-zinc-900/50",
        sort_order: 0
    });

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const res = await fetch("/api/features");
            const data = await res.json();
            if (data.success) setFeatures(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingId ? `/api/features/${editingId}` : "/api/features";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                showToast(editingId ? "Feature updated successfully" : "Feature added successfully", "success");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                    title: "", description: "", icon: "Monitor", col_span: "md:col-span-1", bg_class: "bg-zinc-900/50", sort_order: features.length + 1
                });
                fetchFeatures();
            } else {
                showToast(data.error || "Operation failed", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (feature: Feature) => {
        setEditingId(feature.id);
        setFormData({
            title: feature.title,
            description: feature.description,
            icon: feature.icon,
            col_span: feature.col_span,
            bg_class: feature.bg_class,
            sort_order: feature.sort_order
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({
            title: "", description: "", icon: "Monitor", col_span: "md:col-span-1", bg_class: "bg-zinc-900/50", sort_order: features.length + 1
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this feature?")) return;
        try {
            const res = await fetch(`/api/features/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Feature deleted", "success");
                setFeatures(features.filter(c => c.id !== id));
            }
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8 text-cyan-500" /> Features (Bento Grid)
                    </h1>
                    <p className="text-zinc-400">Manage the "Why Choose Us" grid items.</p>
                </div>
                <Button onClick={handleAddNew} variant="glow">
                    <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <Card key={feature.id} className="border-white/5 bg-zinc-900/50 hover:border-cyan-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-white truncate">{feature.title}</CardTitle>
                                <div className="p-2 rounded-lg bg-white/5 text-cyan-400">
                                    <IconRenderer name={feature.icon} className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400 mb-4 h-12 line-clamp-2">{feature.description}</p>
                                <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-white/5 pt-4">
                                    <span className="bg-white/5 px-2 py-1 rounded">{feature.col_span}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10" onClick={() => handleEdit(feature)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(feature.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Feature" : "Add New Feature"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Title</label>
                        <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-zinc-950/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Description</label>
                        <Input required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-950/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Icon</label>
                            <CustomSelect
                                value={formData.icon}
                                onChange={(val) => setFormData({ ...formData, icon: val })}
                                options={ICONS}
                                placeholder="Select Icon"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Grid Size</label>
                            <CustomSelect
                                value={formData.col_span}
                                onChange={(val) => setFormData({ ...formData, col_span: val })}
                                options={COL_SPANS}
                                placeholder="Select Size"
                            />
                        </div>
                    </div>
                    <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingId ? "Update Feature" : "Create Feature")}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
