"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function Contact() {
    const { settings, loading } = useSiteSettings('contact');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message'),
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                alert("Message sent successfully!");
                (e.target as HTMLFormElement).reset();
            } else {
                const errorData = await res.json();
                alert(`Failed to send message: ${errorData.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 relative overflow-hidden bg-zinc-950/50">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Get in <span className="text-cyan-500">Touch</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        Have questions? Visit us, call us, or send a message. We are here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Information & Map */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-zinc-900/50 border-white/5 hover:border-cyan-500/50 transition-colors">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Phone</h3>
                                        <p className="text-zinc-400 text-sm mt-1">{loading ? "..." : (settings.contact_phone || "0315-2111190")}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 border-white/5 hover:border-cyan-500/50 transition-colors">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Email</h3>
                                        <p className="text-zinc-400 text-sm mt-1">{loading ? "..." : (settings.contact_email || "info@alfununacademy.com")}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-zinc-900/50 border-white/5 overflow-hidden h-[400px]">
                            <iframe
                                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Alfunun+Academy+Musharaf+Colony+Karachi&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card className="border-white/5 bg-zinc-900/30 backdrop-blur-sm">
                        <CardHeader className="text-center">
                            <CardTitle>Send us a Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Name</label>
                                        <Input required name="name" placeholder="Your Name" className="bg-zinc-950/50 border-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Phone</label>
                                        <Input required name="phone" placeholder="Your Phone" className="bg-zinc-950/50 border-white/10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Email</label>
                                    <Input required name="email" type="email" placeholder="Your Email" className="bg-zinc-950/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        className="flex min-h-[150px] w-full rounded-md border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-zinc-500"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <Button type="submit" variant="glow" className="w-full bg-cyan-600 hover:bg-cyan-500" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
