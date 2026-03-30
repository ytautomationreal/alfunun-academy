"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Linkedin, Users, Instagram, Youtube, Github } from "lucide-react";
import Image from "next/image";
import { Teacher } from "@/lib/types";

export default function Team() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<{ shape: string, align: string }>({ shape: 'rounded', align: 'left' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Teachers
                const teachersRes = await fetch("/api/teachers");
                const teachersData = await teachersRes.json();
                if (teachersData.success) setTeachers(teachersData.data);

                // Fetch Settings
                const settingsRes = await fetch("/api/content?section=team");
                const settingsData = await settingsRes.json();
                if (settingsData.success) {
                    setSettings({
                        shape: settingsData.data.team_image_shape || 'rounded',
                        align: settingsData.data.team_text_align || 'left'
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || teachers.length === 0) return null;

    // improved styling logic
    const getImageClass = () => {
        switch (settings.shape) {
            case 'circle': return 'rounded-full';
            case 'square': return 'rounded-none';
            default: return 'rounded-xl'; // 'rounded'
        }
    };

    const getTextAlignClass = () => settings.align === 'center' ? 'text-center items-center' : 'text-left items-start';

    return (
        <section className="py-20 container px-4 md:px-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl -z-10" />

            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                        Meet Our <span className="text-cyan-500">Experts</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Learn from industry veterans who are passionate about sharing their knowledge.
                    </p>
                </motion.div>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
                {teachers.map((teacher, index) => (
                    <motion.div
                        key={teacher.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group h-full w-full max-w-[300px]"
                    >
                        <Card className="border-white/5 bg-zinc-900/40 overflow-hidden hover:border-cyan-500/30 transition-all duration-300 h-full flex flex-col">
                            <div className={`relative overflow-hidden bg-zinc-800 border-b border-white/5 ${settings.shape === 'circle' ? 'rounded-full mt-6 mx-auto w-48 h-48 border border-white/10' : 'w-full aspect-square'}`}>
                                <Image
                                    src={teacher.imageUrl || "/placeholder-user.jpg"}
                                    alt={teacher.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {settings.shape !== 'circle' && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* Social Icons Overlay for Non-Circle (Standard) Layout */}
                                        <div className="absolute bottom-4 right-4 flex flex-col gap-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                                            {/* Icons logic moved to main card body for consistency or kept here? 
                                                Actually, user requested generic center/left check. 
                                                If standard, keep existing specific overlay look? 
                                                Let's unify. If user wants "Center", usually implies content below image.
                                                If "Square/Rounded", typically image is top, content below.
                                                Let's place content BELOW image for all modes to support alignment properly.
                                             */}
                                        </div>
                                    </>
                                )}
                            </div>

                            <CardContent className={`p-6 flex flex-col ${getTextAlignClass()} relative flex-grow`}>
                                <h3 className="text-xl font-bold text-white mb-1">{teacher.name}</h3>
                                <p className="text-cyan-400 font-medium text-sm mb-4">{teacher.role}</p>

                                <div className={`flex gap-4 ${settings.align === 'center' ? 'justify-center' : 'justify-start'} mt-auto w-full`}>
                                    {teacher.facebook && <a href={teacher.facebook} className="text-zinc-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
                                    {teacher.twitter && <a href={teacher.twitter} className="text-zinc-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
                                    {teacher.linkedin && <a href={teacher.linkedin} className="text-zinc-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>}
                                    {teacher.instagram && <a href={teacher.instagram} className="text-zinc-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
                                    {teacher.youtube && <a href={teacher.youtube} className="text-zinc-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>}
                                    {teacher.github && <a href={teacher.github} className="text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
