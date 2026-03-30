"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, LogOut, GraduationCap, Image as ImageIcon, MessageSquare, Menu, X, BookOpen, LayoutTemplate, Palette, LayoutGrid, Cpu, Settings, Mail, Monitor, Receipt, CalendarCheck } from "lucide-react";

const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Active Batches", href: "/admin/batches", icon: Monitor },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Fees", href: "/admin/fees", icon: CreditCard },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Site Content", href: "/admin/content", icon: LayoutTemplate },
    { name: "Theme", href: "/admin/theme", icon: Palette },
    { name: "Features", href: "/admin/features", icon: LayoutGrid },
    { name: "Teachers", href: "/admin/teachers", icon: Users },
    { name: "Technologies", href: "/admin/technologies", icon: Cpu },
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Messages", href: "/admin/messages", icon: Mail },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Groups", href: "/admin/settings/groups", icon: Users },
    { name: "Expenses", href: "/admin/expenses", icon: Receipt },
    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ mobile }: { mobile?: boolean }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-cyan-500" />
                <span className="font-bold text-xl text-white">Alfunun<span className="text-cyan-500">Admin</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => mobile && setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-white/10">
                <Link href="/admin/login">
                    <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </Link>
            </div>
        </div>
    );

    if (mobile) {
        return (
            <>
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950 md:hidden">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-cyan-500" />
                        <span className="font-bold text-lg text-white">Alfunun<span className="text-cyan-500">Admin</span></span>
                    </div>
                    <button onClick={() => setIsOpen(true)} className="text-zinc-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Overlay */}
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                        <div className="relative w-64 h-full bg-zinc-950 border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-200">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <SidebarContent />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-white/10 flex flex-col">
            <SidebarContent />
        </aside>
    );
}
