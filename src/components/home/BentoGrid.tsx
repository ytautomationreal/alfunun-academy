"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, Monitor, Users, Award, Clock, Droplets, Laptop, Shield, LucideIcon, Projector, Presentation, BookOpen, Headphones, Printer, Camera, Video, Globe, Zap, Coffee, AirVent, Lightbulb, GraduationCap, MousePointer2, Keyboard, Server, Database, Code, Palette, PenTool, FileText, Settings, Target, Rocket, Star, Heart, ThumbsUp, Building, MapPin } from "lucide-react";
import { Feature } from "@/lib/types";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    Wifi, Monitor, Users, Award, Clock, Droplets, Laptop, Shield,
    Projector, Presentation, BookOpen, Headphones, Printer, Camera, Video, Globe, Zap, Coffee, AirVent, Lightbulb, GraduationCap,
    MousePointer2, Keyboard, Server, Database, Code, Palette, PenTool, FileText, Settings, Target, Rocket, Star, Heart, ThumbsUp, Building, MapPin
};

export default function BentoGrid() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchFeatures();
    }, []);

    if (loading) return null;

    return (
        <section className="py-20 container px-4 md:px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                    We provide the best environment and resources to help you succeed in your tech journey.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={feature.col_span}
                    >
                        <Card className={`h-full border-white/5 hover:border-cyan-500/30 transition-colors ${feature.bg_class}`}>
                            <CardHeader className="flex flex-col items-center text-center">
                                {(() => {
                                    const IconComponent = iconMap[feature.icon || 'Monitor'] || Monitor;
                                    return <IconComponent className="w-10 h-10 text-cyan-400 mb-4" />;
                                })()}
                                <CardTitle>{feature.title}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
