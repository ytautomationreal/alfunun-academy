"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Palette, Database, Terminal, Cpu, Globe, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, TrendingUp, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Monitor, Laptop, Keyboard, MousePointer2, FileSpreadsheet, FileText, Presentation, PenTool, Image, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Search, Target, Megaphone, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Server, Cloud, Lock, Wifi, Smartphone, TabletSmartphone, AppWindow, Figma, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { Course } from "@/lib/types";

// Icon mapping
const iconMap: Record<string, any> = {
    Code2, Palette, Database, Terminal, Cpu, Globe, Bot, Video, Film, Clapperboard, ShoppingCart, Store, Coins, TrendingUp, LineChart, BarChart3, Bitcoin, Wallet, DollarSign, Monitor, Laptop, Keyboard, MousePointer2, FileSpreadsheet, FileText, Presentation, PenTool, Image, Camera, Brush, Printer, LayoutDashboard, Share2, Mail, MessageCircle, Search, Target, Megaphone, Users, GraduationCap, BookOpen, Award, Rocket, Zap, Shield, Server, Cloud, Lock, Wifi, Smartphone, TabletSmartphone, AppWindow, Figma, Github, BrainCircuit, Sparkles, Wand2, ScanFace, Mic, Headphones, Music, Radio, Play, Youtube
};

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch("/api/courses");
                const data = await res.json();
                if (data.success) {
                    setCourses(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);
    return (
        <main className="min-h-screen pt-24 pb-20 container px-4 md:px-6">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                >
                    Our <span className="text-gradient">Courses</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-lg"
                >
                    Choose from our wide range of industry-oriented courses and start your journey towards a successful career.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="h-full border-white/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col">
                            <CardHeader className="flex flex-col items-center text-center">
                                <div className="mb-4">
                                    <div className="p-3 rounded-lg bg-white/5 inline-flex">
                                        {(() => {
                                            const IconComponent = iconMap[course.icon || 'Code2'] || Code2;
                                            return <IconComponent className={`w-6 h-6 ${course.color}`} />;
                                        })()}
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-zinc-300 mb-2">
                                    {course.duration}
                                </span>
                                <CardTitle className="text-xl">{course.title}</CardTitle>
                                <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow text-center">
                                <div className="text-2xl font-bold text-white">{course.price}</div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/admission" className="w-full">
                                    <Button className="w-full" variant="glow">Enroll Now</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
