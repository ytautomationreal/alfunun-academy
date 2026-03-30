"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Figma, Globe, Layout, Server, Terminal, Cpu, Settings, Command, Box, Layers, LucideIcon, TrendingUp, FileText, Monitor, Smartphone, Search, Megaphone, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Laptop, Keyboard, MousePointer2, FileSpreadsheet, Presentation, PenTool, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Target, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Cloud, Lock, Wifi, TabletSmartphone, AppWindow, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube, Palette, Instagram, Facebook, Twitter, Linkedin, Chrome, Apple, Hash, AtSign, Percent, Calculator, Landmark, Briefcase, Package, CircleDollarSign, CreditCard, PiggyBank, Receipt, SquareStack, Blocks, Component, Workflow, GitBranch } from "lucide-react";
import { Technology } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
    Code2, Database, Figma, Globe, Layout, Server, Terminal, Cpu, Settings, Command, Box, Layers, TrendingUp, FileText, Monitor, Smartphone, Search, Megaphone,
    Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Laptop, Keyboard, MousePointer2, FileSpreadsheet, Presentation, PenTool, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Target, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Cloud, Lock, Wifi, TabletSmartphone, AppWindow, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube, Palette, Instagram, Facebook, Twitter, Linkedin, Chrome, Apple, Hash, AtSign, Percent, Calculator, Landmark, Briefcase, Package, CircleDollarSign, CreditCard, PiggyBank, Receipt, SquareStack, Blocks, Component, Workflow, GitBranch
};

export default function TechMarquee() {
    const [techs, setTechs] = useState<Technology[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchTechs();
    }, []);

    if (loading) return <div className="h-24 bg-zinc-900/30 border-y border-white/5" />;

    // Create a robust loop by repeating enough times
    // If techs is empty, don't crash
    if (techs.length === 0) return null;

    const loopedTechs = [...techs, ...techs, ...techs, ...techs]; // 4x for safety

    return (
        <div className="w-full py-10 bg-zinc-900/30 border-y border-white/5 overflow-hidden">
            <div className="flex relative">
                <motion.div
                    className="flex gap-16 whitespace-nowrap"
                    animate={{ x: [0, -2000] }} // Increased traverse distance for safety
                    transition={{
                        repeat: Infinity,
                        duration: 40, // Slower for readability and longer distance
                        ease: "linear",
                    }}
                >
                    {loopedTechs.map((tech, index) => {
                        const IconComponent = iconMap[tech.icon || 'Code2'] || Code2;
                        return (
                            <div key={index} className="flex items-center gap-2 text-zinc-400">
                                {tech.image_url ? (
                                    <img src={tech.image_url} alt={tech.name} className="w-6 h-6 object-contain" />
                                ) : (
                                    <IconComponent className="w-6 h-6 text-cyan-500" />
                                )}
                                <span className="text-lg font-semibold">{tech.name}</span>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
