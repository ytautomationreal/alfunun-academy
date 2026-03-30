
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Spotlight } from "@/components/ui/spotlight";
import { ParticleNetwork } from "@/components/ui/particle-network";

export default function Hero() {
    const { settings, loading } = useSiteSettings('hero');

    return (
        <section
            className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-black/[0.96] antialiased"
        >

            {/* Particle Network Effect */}
            <ParticleNetwork
                particleCount={parseInt(settings.hero_particle_count || '120')}
                interactionMode={(settings.hero_interaction_mode as 'connect' | 'repel') || 'connect'}
                baseSize={parseInt(settings.hero_particle_size || '2')}
                connectionDistance={parseInt(settings.hero_connection_dist || '150')}
                interactionStrength={parseFloat(settings.hero_interaction_strength || '1.0')}
            />

            {/* Spotlight Effect (Conditional) */}
            {settings.hero_show_spotlight === 'true' && (
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20 z-0 opacity-50"
                    fill="white"
                />
            )}

            <div className="container px-4 md:px-6 relative z-10 text-center w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-cyan-400 mb-8 mx-auto backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        {settings.hero_admission_banner || "Accepting New Admissions for 2025"}
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 pb-2 break-words">
                        {loading ? "Loading..." : (settings.hero_title || "Future-Proof Your Skills")}
                    </h1>

                    <p className="text-base sm:text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed px-2">
                        {loading ? "Loading content..." : (settings.hero_subtitle || "Master Web Development, Graphic Design, and Office Automation with industry-standard tools and expert mentorship.")}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Link href="/admission" className="w-full sm:w-auto">
                            <Button size="lg" variant="glow" className="w-full sm:w-auto text-lg h-14 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]">
                                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/courses" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-10 rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm">
                                View Courses
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
