"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Code2, Phone, Mail, Search, Facebook, Instagram, Twitter, Linkedin, ShoppingCart, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [design, setDesign] = useState(1);
    const [isScrolled, setIsScrolled] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("923001234567");
    const pathname = usePathname();

    useEffect(() => {
        // Fetch design setting
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setDesign(data.headerDesign || 1))
            .catch(err => console.error("Failed to load header design", err));

        // Fetch WhatsApp number from content settings
        fetch('/api/content')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data?.header_whatsapp) {
                    setWhatsappNumber(data.data.header_whatsapp);
                }
            })
            .catch(err => console.error("Failed to load content settings", err));

        // Scroll listener for sticky/transparent effects
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (pathname?.startsWith("/admin")) return null;

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Courses", href: "/courses" },
        { name: "Gallery", href: "/gallery" },
        { name: "Admission", href: "/admission" },
        { name: "Contact Us", href: "/contact" },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    // --- HELPER COMPONENTS ---
    const Logo = ({ className = "" }) => (
        <Link href="/" className={`flex items-center gap-2 ${className}`}>
            <Code2 className="h-8 w-8 text-accent" />
            <span className="text-xl font-bold tracking-wider text-white">
                ALFUNUN<span className="text-accent">ACADEMY</span>
            </span>
        </Link>
    );

    const DesktopNav = ({ className = "text-gray-300 hover:text-accent" }) => (
        <div className="hidden md:flex ml-10 items-baseline space-x-8">
            {navLinks.map((link) => (
                <Link
                    key={link.name}
                    href={link.href}
                    className={`${className} hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md text-sm font-medium`}
                >
                    {link.name}
                </Link>
            ))}
        </div>
    );

    const MobileMenuBtn = () => (
        <div className="-mr-2 flex md:hidden">
            <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
        </div>
    );

    const MobileDrawer = ({ top = "top-16" }) => (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`md:hidden fixed left-0 w-full glass border-t border-white/10 z-40 ${top} max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide`}
                >
                    <div className="px-2 pt-2 pb-8 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-accent block px-3 py-3 rounded-md text-base font-medium border-b border-white/5 last:border-0"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Helper for buttons
    const WhatsAppButton = ({ className = "" }) => (
        <Button
            size="sm"
            variant="glow"
            className={`hidden lg:flex items-center gap-2 rounded-full shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] font-bold tracking-wide ${className}`}
            onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
        >
            <MessageCircle className="w-4 h-4" />
            Chat With Us
        </Button>
    );

    const AdmissionButton = ({ className = "", variant = "glow" as "glow" | "default" | "secondary" }) => (
        <Button variant={variant} size="sm" asChild className={className}>
            <Link href="/admission">Apply Now</Link>
        </Button>
    );

    // --- DESIGNS ---

    // 1. Classic Glass (Original)
    if (design === 1) {
        return (
            <nav className={`fixed w-full z-50 top-0 left-0 border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md' : 'glass'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Logo />
                        <DesktopNav />
                        <div className="hidden md:flex gap-4">
                            <WhatsAppButton />
                        </div>
                        <MobileMenuBtn />
                    </div>
                </div>
                <MobileDrawer />
            </nav>
        );
    }

    // 2. Minimalist White/Dark
    if (design === 2) {
        return (
            <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ${isScrolled ? 'bg-white text-black shadow-md' : 'bg-transparent text-white'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo with dynamic color */}
                        <Link href="/" className="flex items-center gap-2">
                            <Code2 className={`h-8 w-8 ${isScrolled ? 'text-blue-600' : 'text-white'}`} />
                            <span className={`text-xl font-bold tracking-wider ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                ALFUNUN
                            </span>
                        </Link>

                        <div className="hidden md:flex ml-10 items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-200 hover:text-white'} px-3 py-2 rounded-md text-sm font-medium`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="hidden md:flex align-center gap-3">
                            <WhatsAppButton />
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button onClick={toggleMenu} className={`p-2 ${isScrolled ? 'text-black' : 'text-white'}`}>
                                {isOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>
                <MobileDrawer top="top-20" />
            </nav>
        );
    }

    // 3. Centered Logo
    if (design === 3) {
        return (
            <nav className="fixed w-full z-50 top-0 left-0 bg-zinc-950/90 backdrop-blur border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center py-4">
                        <Logo className="mb-4" />
                        <div className="w-full flex justify-center border-t border-white/5 pt-4">
                            <DesktopNav className="text-sm uppercase tracking-widest text-gray-400 hover:text-accent" />
                        </div>
                        <div className="absolute right-4 top-4 md:hidden">
                            <MobileMenuBtn />
                        </div>
                    </div>
                </div>
                <MobileDrawer top="top-[120px]" />
            </nav>
        );
    }

    // 4. Split Navigation (Logo Middle)
    if (design === 4) {
        const leftLinks = navLinks.slice(0, 3);
        const rightLinks = navLinks.slice(3);
        return (
            <nav className="fixed w-full z-50 top-0 left-0 bg-black/80 backdrop-blur-lg border-b border-white/10 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
                    <div className="hidden md:flex space-x-8">
                        {leftLinks.map(l => <Link key={l.name} href={l.href} className="text-gray-300 hover:text-white text-sm font-medium">{l.name}</Link>)}
                    </div>

                    <div className="flex-shrink-0 mx-auto">
                        <Logo />
                    </div>

                    <div className="hidden md:flex space-x-8 items-center">
                        {rightLinks.map(l => <Link key={l.name} href={l.href} className="text-gray-300 hover:text-white text-sm font-medium">{l.name}</Link>)}
                        <WhatsAppButton />
                    </div>
                    <MobileMenuBtn />
                </div>
                <MobileDrawer top="top-20" />
            </nav>
        );
    }

    // 5. Corporate Blue (Top Bar + Main Nav)
    if (design === 5) {
        return (
            <div className="fixed w-full z-50 top-0 left-0">
                {/* Top Bar */}
                <div className="bg-blue-900 text-white text-xs py-2 px-4 hidden md:flex justify-between items-center">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +92 300 1234567</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> info@alfunun.com</span>
                    </div>
                    <div className="flex gap-3">
                        <Facebook className="w-3 h-3 hover:text-blue-400 cursor-pointer" />
                        <Twitter className="w-3 h-3 hover:text-blue-400 cursor-pointer" />
                        <Instagram className="w-3 h-3 hover:text-pink-400 cursor-pointer" />
                    </div>
                </div>
                {/* Main Nav */}
                <nav className="bg-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Code2 className="h-8 w-8 text-blue-900" />
                            <span className="text-xl font-bold tracking-wider text-gray-900">ALFUNUN</span>
                        </Link>
                        <div className="hidden md:flex space-x-8">
                            {navLinks.map(l => (
                                <Link key={l.name} href={l.href} className="text-gray-700 hover:text-blue-900 font-semibold text-sm uppercase">
                                    {l.name}
                                </Link>
                            ))}
                        </div>
                        <div className="hidden md:flex gap-2">
                            <WhatsAppButton />
                            <AdmissionButton className="bg-blue-900 hover:bg-blue-800 text-white" />
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button onClick={toggleMenu} className="p-2 text-gray-800"><Menu /></button>
                        </div>
                    </div>
                </nav>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t">
                            <div className="px-2 py-3 space-y-1">
                                {navLinks.map(l => <Link key={l.name} href={l.href} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-800 font-medium">{l.name}</Link>)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // 6. Floating Island (Modern Pill)
    if (design === 6) {
        return (
            <div className="fixed w-full z-50 top-4 left-0 flex justify-center px-4">
                <nav className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl max-w-4xl w-full justify-between md:justify-start">
                    <Link href="/" className="flex items-center gap-2 mr-4">
                        <Code2 className="h-6 w-6 text-accent" />
                        <span className="text-lg font-bold text-white hidden sm:block">ALFUNUN</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-full px-2 py-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-300 hover:bg-white/10 hover:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex ml-auto items-center gap-3">
                        <WhatsAppButton />
                        <AdmissionButton className="rounded-full bg-accent hover:bg-accent/90 text-white" />
                    </div>

                    <div className="flex md:hidden ml-auto">
                        <button onClick={toggleMenu} className="text-white"><Menu /></button>
                    </div>
                </nav>
                {isOpen && (
                    <div className="absolute top-20 left-4 right-4 bg-zinc-900 rounded-2xl p-4 border border-white/10 md:hidden">
                        {navLinks.map(l => <Link key={l.name} href={l.href} onClick={() => setIsOpen(false)} className="block p-3 text-white border-b border-white/5 last:border-0">{l.name}</Link>)}
                    </div>
                )}
            </div>
        );
    }

    // 7. Sidebar Style (Left Vertical) - Only for desktop, fallback mobile
    if (design === 7) {
        return (
            <>
                {/* Desktop Sidebar */}
                <nav className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-zinc-950 border-r border-white/10 flex-col p-6 z-50">
                    <Logo className="mb-12" />
                    <div className="flex flex-col space-y-4 flex-1">
                        {navLinks.map(link => (
                            <Link key={link.name} href={link.href} className="flex items-center gap-3 text-gray-400 hover:text-accent hover:bg-white/5 px-4 py-3 rounded-xl transition-all">
                                <span className="text-lg font-medium">{link.name}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="my-4">
                        <WhatsAppButton className="w-full justify-start pl-4" />
                        <AdmissionButton className="w-full" />
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex gap-4 justify-center text-gray-500">
                            <Instagram className="hover:text-white" />
                            <Twitter className="hover:text-white" />
                            <Youtube className="hover:text-white" />
                        </div>
                    </div>
                </nav>

                {/* Mobile Fallback (Simple Top) */}
                <nav className="md:hidden fixed w-full z-50 top-0 left-0 bg-zinc-950 border-b border-white/10 p-4 flex justify-between items-center">
                    <Logo />
                    <MobileMenuBtn />
                </nav>
                <MobileDrawer />
            </>
        );
    }

    // 8. Gradient Header
    if (design === 8) {
        return (
            <nav className="fixed w-full z-50 top-0 left-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Logo />
                        <DesktopNav className="text-purple-100 hover:text-white hover:bg-white/10" />
                        <div className="hidden md:flex gap-4">
                            <WhatsAppButton />
                            <AdmissionButton className="bg-white text-purple-900 hover:bg-gray-100 font-bold" />
                        </div>
                        <MobileMenuBtn />
                    </div>
                </div>
                <MobileDrawer top="top-16" />
            </nav>
        );
    }

    // 9. Mega Menu Style (Bottom Border Accent)
    if (design === 9) {
        return (
            <nav className="fixed w-full z-50 top-0 left-0 bg-zinc-900 border-b-4 border-accent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Logo />
                        <div className="hidden md:flex space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-300 hover:text-white hover:bg-zinc-800 px-5 py-7 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 border-transparent hover:border-white"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="hidden md:flex">
                            <WhatsAppButton />
                        </div>
                        <MobileMenuBtn />
                    </div>
                </div>
                <MobileDrawer top="top-20" />
            </nav>
        );
    }

    // 10. Futuristic/Cyberpunk
    if (design === 10) {
        return (
            <nav className="fixed w-full z-50 top-0 left-0 bg-black/90 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <Code2 className="h-8 w-8 text-cyan-400" />
                            <span className="text-xl font-bold tracking-widest text-cyan-50 font-mono">
                                AL<span className="text-cyan-400">FUNUN</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex ml-10 items-center space-x-1">
                            <div className="h-8 w-[1px] bg-cyan-900 mr-4"></div>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-cyan-100/70 hover:text-cyan-400 hover:bg-cyan-950/30 px-3 py-1 rounded-sm text-sm font-mono transition-all border border-transparent hover:border-cyan-500/30"
                                >
                                    {`// ${link.name}`}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex ml-4 gap-2">
                            <WhatsAppButton />
                            <Button variant="outline" asChild className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 font-mono text-xs">
                                <Link href="/admission">INIT_APPLY()</Link>
                            </Button>
                        </div>
                        <MobileMenuBtn />
                    </div>
                </div>
                <MobileDrawer top="top-16" />
            </nav>
        );
    }

    return null; // Fallback
};

// Start icon fix for sidebar 7
function Youtube(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <path d="m10 15 5-3-5-3z" />
        </svg>
    )
}

export default Navbar;
