"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Ali Raza",
        role: "Web Developer",
        text: "Alfunun Academy changed my life. The mentorship was top-notch, and I landed a job within 2 months of graduating.",
    },
    {
        name: "Sara Khan",
        role: "Graphic Designer",
        text: "The creative environment here is amazing. I learned so much about design principles and tools.",
    },
    {
        name: "Usman Ahmed",
        role: "Freelancer",
        text: "Thanks to the freelancing support, I started earning on Upwork while still studying. Highly recommended!",
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-zinc-900/30 border-y border-white/5">
            <div className="container px-4 md:px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Student Success Stories</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <Card className="h-full border-white/5 bg-zinc-900/50">
                                <CardContent className="pt-6">
                                    <Quote className="w-8 h-8 text-cyan-500/50 mb-4" />
                                    <p className="text-zinc-300 mb-6 italic">"{t.text}"</p>
                                    <div>
                                        <h4 className="font-bold text-white">{t.name}</h4>
                                        <p className="text-sm text-cyan-400">{t.role}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
