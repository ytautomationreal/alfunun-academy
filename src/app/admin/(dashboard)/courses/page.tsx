"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, Loader2, Code2, Database, Globe, Palette, Terminal, Cpu, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, TrendingUp, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Monitor, Laptop, Keyboard, MousePointer2, FileSpreadsheet, FileText, Presentation, PenTool, Image, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Search, Target, Megaphone, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Server, Cloud, Lock, Wifi, Smartphone, TabletSmartphone, AppWindow, Figma, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube } from "lucide-react";
import { Course } from "@/lib/types";
import { CustomSelect } from "@/components/ui/custom-select";

const ICONS = [
    // AI & Automation
    { value: "Bot", label: "🤖 AI / Chatbot" },
    { value: "BrainCircuit", label: "🧠 AI / Machine Learning" },
    { value: "Sparkles", label: "✨ AI / Generative" },
    { value: "Wand2", label: "🪄 AI Magic / Automation" },
    { value: "ScanFace", label: "👤 AI Face Recognition" },

    // Video & Media
    { value: "Video", label: "🎬 Video Editing" },
    { value: "Film", label: "🎞️ Film / Movie" },
    { value: "Clapperboard", label: "🎬 Video Production" },
    { value: "Youtube", label: "▶️ YouTube" },
    { value: "Play", label: "▶️ Media Player" },
    { value: "Camera", label: "📷 Photography" },
    { value: "Image", label: "🖼️ Image Editing" },

    // Audio & Podcasting
    { value: "Mic", label: "🎤 Podcasting / Voice" },
    { value: "Headphones", label: "🎧 Audio / Sound" },
    { value: "Music", label: "🎵 Music Production" },
    { value: "Radio", label: "📻 Broadcasting" },

    // E-Commerce & Business
    { value: "ShoppingCart", label: "🛒 Shopify / E-Commerce" },
    { value: "Store", label: "🏪 Amazon / Online Store" },
    { value: "DollarSign", label: "💵 Business / Sales" },

    // Trading & Finance
    { value: "TrendingUp", label: "📈 Forex / Trading" },
    { value: "LineChart", label: "📊 Stocks / Charts" },
    { value: "BarChart3", label: "📊 Analytics" },
    { value: "Bitcoin", label: "₿ Binance / Crypto" },
    { value: "Coins", label: "🪙 Cryptocurrency" },
    { value: "Wallet", label: "👝 Wallet / Payments" },

    // Digital Marketing
    { value: "Megaphone", label: "📢 Digital Marketing" },
    { value: "Target", label: "🎯 Ads / Targeting" },
    { value: "Search", label: "🔍 SEO" },
    { value: "Share2", label: "📤 Social Media" },
    { value: "Mail", label: "📧 Email Marketing" },
    { value: "MessageCircle", label: "💬 SMM" },
    { value: "Globe", label: "🌐 Web / Internet" },

    // Programming & Development
    { value: "Code2", label: "💻 Coding / Dev" },
    { value: "Terminal", label: "⌨️ Terminal / CLI" },
    { value: "Database", label: "🗄️ Database / SQL" },
    { value: "Server", label: "🖥️ Backend / Server" },
    { value: "Cloud", label: "☁️ Cloud Computing" },
    { value: "AppWindow", label: "📱 App Development" },
    { value: "Github", label: "🐙 Git / GitHub" },

    // Design & Graphics
    { value: "Palette", label: "🎨 Graphic Design" },
    { value: "PenTool", label: "✒️ Illustrator / Vector" },
    { value: "Brush", label: "🖌️ Photoshop / Art" },
    { value: "Figma", label: "🎨 UI/UX / Figma" },
    { value: "LayoutDashboard", label: "📐 Layout Design" },

    // Office & Basic Computer
    { value: "Monitor", label: "🖥️ Basic Computer" },
    { value: "Laptop", label: "💻 Laptop / PC" },
    { value: "Keyboard", label: "⌨️ Typing / Data Entry" },
    { value: "MousePointer2", label: "🖱️ Computer Basics" },
    { value: "FileSpreadsheet", label: "📊 Excel / Sheets" },
    { value: "FileText", label: "📄 MS Word / Docs" },
    { value: "Presentation", label: "📽️ PowerPoint / Slides" },
    { value: "Printer", label: "🖨️ Office Skills" },

    // Mobile & Devices
    { value: "Smartphone", label: "📱 Mobile Apps" },
    { value: "TabletSmartphone", label: "📲 Responsive / Mobile" },

    // Network & Security
    { value: "Wifi", label: "📶 Networking" },
    { value: "Lock", label: "🔒 Cyber Security" },
    { value: "Shield", label: "🛡️ Security" },

    // Other
    { value: "Cpu", label: "🔧 Hardware" },
    { value: "GraduationCap", label: "🎓 Certificate Course" },
    { value: "BookOpen", label: "📖 Tutorial / Learning" },
    { value: "Award", label: "🏆 Professional" },
    { value: "Rocket", label: "🚀 Advanced" },
    { value: "Zap", label: "⚡ Quick Course" },
    { value: "Users", label: "👥 Team / Group" },
];

const COLORS = [
    { value: "text-cyan-400", label: "Cyan" },
    { value: "text-purple-400", label: "Purple" },
    { value: "text-green-400", label: "Green" },
    { value: "text-yellow-400", label: "Yellow" },
    { value: "text-blue-400", label: "Blue" },
    { value: "text-red-400", label: "Red" },
];

export default function CoursesManagement() {
    const { showToast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: "",
        price: "",
        icon: "Code2",
        color: "text-cyan-400",
        category: "Development",
        sort_order: 0,
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            const data = await res.json();
            if (data.success) setCourses(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingId ? `/api/courses/${editingId}` : "/api/courses";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                showToast(`Course ${editingId ? "updated" : "added"} successfully`, "success");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                    title: "", description: "", duration: "", price: "", icon: "Code2", color: "text-cyan-400", category: "Development", sort_order: 0
                });
                fetchCourses();
            } else {
                showToast(data.error || "Operation failed", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Course deleted", "success");
                setCourses(courses.filter(c => c.id !== id));
            }
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    };

    const openEdit = (course: Course) => {
        setEditingId(course.id);
        setFormData({
            title: course.title,
            description: course.description,
            duration: course.duration,
            price: course.price,
            icon: course.icon,
            color: course.color,
            category: course.category,
            sort_order: course.sort_order || 0
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Courses Management</h1>
                <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} variant="glow">
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="border-white/5 bg-zinc-900/50 hover:border-cyan-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-white truncate">{course.title}</CardTitle>
                                <div className={`p-2 rounded-lg bg-white/5 ${course.color}`}>
                                    {/* Icon Rendering Logic */}
                                    {(() => {
                                        const iconMap: any = {
                                            Code2, Database, Globe, Palette, Terminal, Cpu, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, TrendingUp, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Monitor, Laptop, Keyboard, MousePointer2, FileSpreadsheet, FileText, Presentation, PenTool, Image, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Search, Target, Megaphone, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Server, Cloud, Lock, Wifi, Smartphone, TabletSmartphone, AppWindow, Figma, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube
                                        };
                                        const IconComponent = iconMap[course.icon] || Code2;
                                        return <IconComponent className="w-5 h-5" />;
                                    })()}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400 mb-4 h-10 line-clamp-2">{course.description}</p>
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="bg-white/5 px-2 py-1 rounded text-zinc-300">{course.duration}</span>
                                    <span className="font-bold text-cyan-400">{course.price}</span>
                                </div>
                                <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                                    <Button size="sm" variant="ghost" onClick={() => openEdit(course)}>
                                        <Edit className="w-4 h-4 text-zinc-400 hover:text-cyan-400" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(course.id)}>
                                        <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Course" : "Add New Course"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Course Title</label>
                        <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-zinc-950/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Description</label>
                        <Input required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-950/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Duration</label>
                            <Input required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="bg-zinc-950/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Price</label>
                            <Input required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-zinc-950/50" />
                        </div>
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
                            <label className="text-sm font-medium text-zinc-300">Color</label>
                            <CustomSelect
                                value={formData.color}
                                onChange={(val) => setFormData({ ...formData, color: val })}
                                options={COLORS}
                                placeholder="Select Color"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Category</label>
                        <Input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-zinc-950/50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Sort Order</label>
                        <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="bg-zinc-950/50" />
                    </div>
                    <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingId ? "Update Course" : "Create Course")}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
