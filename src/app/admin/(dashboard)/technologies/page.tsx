"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Loader2, Cpu, Code2, Server, Database, Globe, Layout, Terminal, Figma, Settings, Command, Box, Layers, Edit, TrendingUp, FileText, Monitor, Smartphone, Search, Megaphone, Upload, Link as LinkIcon, Image as ImageIcon, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Laptop, Keyboard, MousePointer2, FileSpreadsheet, Presentation, PenTool, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Target, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Cloud, Lock, Wifi, TabletSmartphone, AppWindow, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube, Palette, Instagram, Facebook, Twitter, Linkedin, Chrome, Apple, Hash, AtSign, Percent, Calculator, Landmark, Briefcase, Package, CircleDollarSign, CreditCard, PiggyBank, Receipt, SquareStack, Blocks, Component, Workflow, GitBranch } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { Technology } from "@/lib/types";

// Extensive list of tech icons
const ICONS = [
    // Design & Creative Tools
    { value: "Figma", label: "🎨 Figma / Canva / Design" },
    { value: "Palette", label: "🎨 Canva / Graphics" },
    { value: "PenTool", label: "✒️ Illustrator / Vector" },
    { value: "Brush", label: "🖌️ Photoshop / Art" },
    { value: "Layout", label: "📐 Layout / UI Design" },
    { value: "LayoutDashboard", label: "📊 Dashboard Design" },

    // AI & Automation
    { value: "Bot", label: "🤖 AI / ChatGPT" },
    { value: "BrainCircuit", label: "🧠 Machine Learning" },
    { value: "Sparkles", label: "✨ Generative AI" },
    { value: "Wand2", label: "🪄 AI Automation" },
    { value: "ScanFace", label: "👤 AI Recognition" },
    { value: "Cpu", label: "⚙️ Python / AI" },

    // Video & Media Production
    { value: "Video", label: "🎬 Video Editing" },
    { value: "Film", label: "🎞️ Premiere Pro" },
    { value: "Clapperboard", label: "🎬 After Effects" },
    { value: "Youtube", label: "▶️ YouTube" },
    { value: "Play", label: "▶️ Media" },
    { value: "Camera", label: "📷 Photography" },

    // Audio & Music
    { value: "Mic", label: "🎤 Podcasting" },
    { value: "Headphones", label: "🎧 Audio Editing" },
    { value: "Music", label: "🎵 Music Production" },
    { value: "Radio", label: "📻 Broadcasting" },

    // E-Commerce & Business
    { value: "ShoppingCart", label: "🛒 Shopify" },
    { value: "Store", label: "🏪 Amazon / eBay" },
    { value: "Package", label: "📦 Dropshipping" },
    { value: "DollarSign", label: "💵 Business" },
    { value: "Briefcase", label: "💼 Freelancing" },
    { value: "CreditCard", label: "💳 Payments" },

    // Trading & Finance
    { value: "TrendingUp", label: "📈 Forex Trading" },
    { value: "LineChart", label: "📊 Stock Market" },
    { value: "BarChart3", label: "📊 Technical Analysis" },
    { value: "Bitcoin", label: "₿ Binance / Crypto" },
    { value: "Coins", label: "🪙 Cryptocurrency" },
    { value: "Wallet", label: "👝 MetaTrader" },
    { value: "Landmark", label: "🏦 Banking" },

    // Digital Marketing & SEO
    { value: "Megaphone", label: "📢 Digital Marketing" },
    { value: "Target", label: "🎯 Facebook Ads" },
    { value: "Search", label: "🔍 SEO / Google" },
    { value: "Share2", label: "📤 Social Media" },
    { value: "Mail", label: "📧 Email Marketing" },
    { value: "MessageCircle", label: "💬 WhatsApp Marketing" },
    { value: "Globe", label: "🌐 Web Marketing" },
    { value: "Hash", label: "# Hashtag / SMM" },
    { value: "AtSign", label: "@ Social Handle" },

    // Social Platforms
    { value: "Instagram", label: "📸 Instagram" },
    { value: "Facebook", label: "📘 Facebook" },
    { value: "Twitter", label: "🐦 Twitter / X" },
    { value: "Linkedin", label: "💼 LinkedIn" },

    // Programming & Development
    { value: "Code2", label: "💻 HTML / CSS / React" },
    { value: "Terminal", label: "⌨️ JavaScript / Node" },
    { value: "Database", label: "🗄️ Database / SQL" },
    { value: "Server", label: "🖥️ Backend / API" },
    { value: "Cloud", label: "☁️ AWS / Cloud" },
    { value: "AppWindow", label: "📱 Flutter / React Native" },
    { value: "Github", label: "🐙 Git / GitHub" },
    { value: "Chrome", label: "🌐 Web Browser" },
    { value: "Workflow", label: "⚡ WordPress" },
    { value: "GitBranch", label: "🔀 Version Control" },

    // Office & Computer Skills
    { value: "Monitor", label: "🖥️ Basic Computer" },
    { value: "Laptop", label: "💻 PC Skills" },
    { value: "Keyboard", label: "⌨️ Typing" },
    { value: "FileSpreadsheet", label: "📊 Excel / Sheets" },
    { value: "FileText", label: "📄 MS Word" },
    { value: "Presentation", label: "📽️ PowerPoint" },
    { value: "Printer", label: "🖨️ Office Skills" },
    { value: "Calculator", label: "🧮 Accounting" },

    // Mobile & Apps
    { value: "Smartphone", label: "📱 Mobile Apps" },
    { value: "TabletSmartphone", label: "📲 iOS / Android" },
    { value: "Apple", label: "🍎 iOS Development" },

    // Security & Networking
    { value: "Wifi", label: "📶 Networking" },
    { value: "Lock", label: "🔒 Cyber Security" },
    { value: "Shield", label: "🛡️ Ethical Hacking" },

    // Other
    { value: "GraduationCap", label: "🎓 Certificate" },
    { value: "BookOpen", label: "📖 Learning" },
    { value: "Award", label: "🏆 Professional" },
    { value: "Rocket", label: "🚀 Advanced" },
    { value: "Zap", label: "⚡ Quick Start" },
    { value: "Users", label: "👥 Team" },
    { value: "Settings", label: "⚙️ Settings" },
    { value: "Command", label: "⌘ Command" },
    { value: "Box", label: "📦 3D / Blender" },
    { value: "Layers", label: "📚 Layers" },
    { value: "Blocks", label: "🧱 Blocks" },
    { value: "Component", label: "🔧 Components" },
];

const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = {
        Code2, Server, Database, Globe, Layout, Terminal, Figma, Cpu, Settings, Command, Box, Layers, TrendingUp, FileText, Monitor, Smartphone, Search, Megaphone,
        Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Laptop, Keyboard, MousePointer2, FileSpreadsheet, Presentation, PenTool, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Target, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Cloud, Lock, Wifi, TabletSmartphone, AppWindow, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube, Palette, Instagram, Facebook, Twitter, Linkedin, Chrome, Apple, Hash, AtSign, Percent, Calculator, Landmark, Briefcase, Package, CircleDollarSign, CreditCard, PiggyBank, Receipt, SquareStack, Blocks, Component, Workflow, GitBranch
    };
    const Icon = icons[name] || Code2;
    return <Icon className={className} />;
};

export default function TechnologiesManagement() {
    const { showToast } = useToast();
    const [techs, setTechs] = useState<Technology[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [iconType, setIconType] = useState<'icon' | 'url' | 'upload'>('icon');
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        icon: "Code2",
        image_url: ""
    });

    useEffect(() => {
        fetchTechs();
    }, []);

    const fetchTechs = async () => {
        try {
            const res = await fetch("/api/technologies");
            const data = await res.json();
            if (data.success) setTechs(data.data);
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
            const url = editingId ? `/api/technologies/${editingId}` : "/api/technologies";
            const method = editingId ? "PUT" : "POST";

            let finalImageUrl = formData.image_url;

            // Handle file upload if selected
            if (iconType === 'upload' && uploadFile) {
                const uploadData = new FormData();
                uploadData.append('file', uploadFile);

                try {
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadData,
                    });
                    const uploadResult = await uploadRes.json();

                    if (uploadResult.success) {
                        finalImageUrl = uploadResult.url;
                    } else {
                        throw new Error(uploadResult.error || "Upload failed");
                    }
                } catch (err: any) {
                    showToast(err.message, "error");
                    setIsSubmitting(false);
                    return;
                }
            } else if (iconType === 'icon') {
                finalImageUrl = ""; // Clear image URL if switching back to icon
            }

            const bodyData = {
                name: formData.name,
                icon: formData.icon,
                image_url: finalImageUrl
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });
            const data = await res.json();

            if (data.success) {
                showToast(editingId ? "Technology updated" : "Technology added", "success");
                setIsModalOpen(false);
                showToast(editingId ? "Technology updated" : "Technology added", "success");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ name: "", icon: "Code2", image_url: "" });
                setIconType('icon');
                setUploadFile(null);
                fetchTechs();
            } else {
                showToast(data.error || "Operation failed", "error");
            }
        } catch (error) {
            showToast("Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (tech: Technology) => {
        setEditingId(tech.id);
        setIconType(tech.image_url ? 'url' : 'icon');
        setFormData({
            name: tech.name,
            icon: tech.icon || "Code2",
            image_url: tech.image_url || ""
        });
        setUploadFile(null);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setIconType('icon');
        setUploadFile(null);
        setFormData({ name: "", icon: "Code2", image_url: "" });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this technology?")) return;
        try {
            const res = await fetch(`/api/technologies/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Deleted", "success");
                setTechs(techs.filter(t => t.id !== id));
            }
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Cpu className="w-8 h-8 text-cyan-500" /> Technologies (Marquee)
                    </h1>
                    <p className="text-zinc-400">Manage the scrolling tech logos.</p>
                </div>
                <Button onClick={handleAddNew} variant="glow">
                    <Plus className="mr-2 h-4 w-4" /> Add Tech
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {techs.map((tech) => (
                        <Card key={tech.id} className="border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-all group relative">
                            <CardContent className="p-6 flex flex-col items-center gap-3">
                                <div className="p-3 rounded-full bg-white/5 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                                    {tech.image_url ? (
                                        <img src={tech.image_url} alt={tech.name} className="w-8 h-8 object-contain" />
                                    ) : (
                                        <IconRenderer name={tech.icon} className="w-8 h-8" />
                                    )}
                                </div>
                                <span className="font-medium text-zinc-300">{tech.name}</span>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(tech)}
                                        className="p-1 text-zinc-600 hover:text-cyan-400"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tech.id)}
                                        className="p-1 text-zinc-600 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Technology" : "Add New Technology"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Name</label>
                        <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-950/50" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-zinc-300">Icon Source</label>
                        <div className="flex p-1 bg-zinc-900/50 rounded-lg border border-white/5">
                            <button
                                type="button"
                                onClick={() => setIconType('icon')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${iconType === 'icon' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-zinc-400 hover:text-zinc-200"}`}
                            >
                                <Code2 className="w-4 h-4" /> Built-in
                            </button>
                            <button
                                type="button"
                                onClick={() => setIconType('url')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${iconType === 'url' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-zinc-400 hover:text-zinc-200"}`}
                            >
                                <LinkIcon className="w-4 h-4" /> URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setIconType('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${iconType === 'upload' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-zinc-400 hover:text-zinc-200"}`}
                            >
                                <Upload className="w-4 h-4" /> Upload
                            </button>
                        </div>
                    </div>

                    {iconType === 'icon' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Select Icon</label>
                            <CustomSelect
                                value={formData.icon}
                                onChange={(val) => setFormData({ ...formData, icon: val })}
                                options={ICONS}
                                placeholder="Select Icon"
                            />
                        </div>
                    )}

                    {iconType === 'url' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Image URL</label>
                            <Input
                                placeholder="https://example.com/logo.png"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="bg-zinc-950/50 border-white/10 focus:border-cyan-500/50"
                            />
                            <p className="text-xs text-zinc-500">
                                ℹ️ Paste a direct link to a PNG or SVG image.
                            </p>
                        </div>
                    )}

                    {iconType === 'upload' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Upload Image</label>
                            <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-cyan-500/30 transition-colors bg-zinc-900/20">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-zinc-500" />
                                    <span className="text-sm text-zinc-300 font-medium">
                                        {uploadFile ? uploadFile.name : "Click to select file"}
                                    </span>
                                    <span className="text-xs text-zinc-500">Supports PNG, JPG, SVG (Max 2MB)</span>
                                </label>
                            </div>
                        </div>
                    )}
                    <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingId ? "Update" : "Add to Marquee")}
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
