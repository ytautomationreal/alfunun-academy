"use client";

import { motion } from "framer-motion";

import { useSiteSettings } from "@/hooks/use-site-settings";

export default function StatsCounter() {
    const { settings, loading } = useSiteSettings('stats');

    const stats = [
        { label: "Students Enrolled", value: settings.stats_students || "500+", color: "text-cyan-400" },
        { label: "Expert Mentors", value: settings.stats_mentors || "15+", color: "text-indigo-400" },
        { label: "Job Success Rate", value: settings.stats_job_success || "100%", color: "text-green-400" },
        { label: "Active Batches", value: settings.stats_batches || "8", color: "text-purple-400" },
    ];

    return (
        <section className="py-20 bg-zinc-900/30 border-y border-white/5">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                        >
                            <h3 className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                                {loading ? "..." : stat.value}
                            </h3>
                            <p className="text-zinc-400 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
