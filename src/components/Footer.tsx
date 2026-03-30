"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

import { useSiteSettings } from "@/hooks/use-site-settings";

export default function Footer() {
    const pathname = usePathname();
    const { settings, loading } = useSiteSettings();

    if (pathname?.startsWith("/admin")) return null;

    return (
        <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-8">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-12 text-center md:text-left">
                    {/* Brand */}
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center gap-2">
                            <Code2 className="h-8 w-8 text-cyan-500" />
                            <span className="text-xl font-bold tracking-wider text-white">
                                ALFUNUN<span className="text-cyan-500">ACADEMY</span>
                            </span>
                        </Link>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                            Empowering the next generation of tech leaders with cutting-edge skills in development, design, and automation.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <a href="#" className="text-zinc-400 hover:text-cyan-500 transition-colors p-2 -m-2"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="text-zinc-400 hover:text-cyan-500 transition-colors p-2 -m-2"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-zinc-400 hover:text-cyan-500 transition-colors p-2 -m-2"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="text-zinc-400 hover:text-cyan-500 transition-colors p-2 -m-2"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Home</Link></li>
                            <li><Link href="/about" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">About Us</Link></li>
                            <li><Link href="/courses" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Courses</Link></li>
                            <li><Link href="/gallery" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Student Gallery</Link></li>
                            <li><Link href="/admission" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Apply Now</Link></li>
                            <li><Link href="/contact" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <h3 className="font-semibold text-white mb-6">Our Courses</h3>
                        <ul className="space-y-2">
                            <li><Link href="/courses" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Web Development</Link></li>
                            <li><Link href="/courses" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Graphic Design</Link></li>
                            <li><Link href="/courses" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Office Automation</Link></li>
                            <li><Link href="/courses" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Digital Marketing</Link></li>
                            <li><Link href="/courses" className="text-zinc-400 hover:text-cyan-500 text-sm transition-colors block py-1.5">Freelancing</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-white mb-6">Contact Info</h3>
                        <ul className="space-y-4 inline-block text-left md:block">
                            <li className="flex items-start gap-3 text-zinc-400 text-sm">
                                <MapPin className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                <span className="max-w-[200px]">{loading ? "..." : (settings.contact_address || "Alfunun Academy, Main Boulevard, Lahore, Pakistan")}</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-400 text-sm">
                                <Phone className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>{loading ? "..." : (settings.contact_phone || "+92 300 1234567")}</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-400 text-sm">
                                <Mail className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>{loading ? "..." : (settings.contact_email || "info@alfunun.edu.pk")}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 text-center md:text-left">
                    <p className="text-zinc-500 text-sm">
                        {loading ? "..." : (settings.footer_copyright || `© ${new Date().getFullYear()} Alfunun Computer Academy. All rights reserved.`)}
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
                        <Link href="/privacy" className="hover:text-white transition-colors py-2 md:py-0">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors py-2 md:py-0">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
