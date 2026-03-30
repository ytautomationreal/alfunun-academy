"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Palette, Database, Terminal, Cpu, Globe, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, TrendingUp, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Monitor, Laptop, Keyboard, MousePointer2, FileSpreadsheet, FileText, Presentation, PenTool, Image, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Search, Target, Megaphone, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Server, Cloud, Lock, Wifi, Smartphone, TabletSmartphone, AppWindow, Figma, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube, LucideIcon } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { Course } from "@/lib/types";

// Icon mapping helper
const iconMap: Record<string, LucideIcon> = {
    Code2, Palette, Database, Terminal, Cpu, Globe, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, TrendingUp, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Monitor, Laptop, Keyboard, MousePointer2, FileSpreadsheet, FileText, Presentation, PenTool, Image, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Search, Target, Megaphone, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Server, Cloud, Lock, Wifi, Smartphone, TabletSmartphone, AppWindow, Figma, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube
};

export default function CourseCarousel() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses");
                const data = await res.json();
                if (data.success) {
                    setCourses(data.data.slice(0, 6)); // Show top 6
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return null; // Or a skeleton loader

    return (
        <section className="py-20 container px-4 md:px-6 overflow-hidden">
            <div className="flex flex-col items-center text-center mb-12 gap-4">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Top Courses</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto">
                        Explore our most popular programs designed to get you job-ready.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ y: -10 }}
                    >
                        <Card className="h-full border-white/5 bg-zinc-900/50 hover:border-cyan-500/30 transition-all duration-300 group">
                            <CardHeader className="p-4 pb-2">
                                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors`}>
                                    {(() => {
                                        const IconComponent = iconMap[course.icon || 'Code2'] || Code2;
                                        return <IconComponent className={`w-5 h-5 ${course.color}`} />;
                                    })()}
                                </div>
                                <CardTitle className="text-lg group-hover:text-cyan-400 transition-colors text-left">
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="text-left text-xs line-clamp-2 mt-1">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-zinc-400 bg-white/5 px-2 py-1 rounded">{course.duration}</span>
                                    <span className="font-bold text-cyan-400">{course.price}</span>
                                </div>
                                <Link href="/contact" className="w-full">
                                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:text-cyan-400 px-0 hover:bg-transparent hover:text-cyan-300 h-8 text-sm">
                                        Learn More <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center mt-12">
                <Link href="/courses">
                    <Button variant="outline" className="border-white/10 px-8 py-6 text-lg hover:bg-white/5 hover:text-cyan-400 transition-colors">
                        View All Courses <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
