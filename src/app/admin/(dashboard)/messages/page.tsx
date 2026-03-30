"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Phone, Mail, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Message {
    id: number;
    name: string;
    phone: string;
    email: string;
    message: string;
    created_at: string;
}

export default function MessagesPage() {
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/admin/messages");
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setMessages((prev) => prev.filter((msg) => msg.id !== id));
                showToast("Message deleted", "success");
            } else {
                showToast("Failed to delete", "error");
            }
        } catch (error) {
            showToast("Error deleting message", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Messages
            </h1>

            <div className="grid gap-6">
                {messages.length === 0 ? (
                    <Card className="bg-zinc-900/50 border-white/10">
                        <CardContent className="p-8 text-center text-zinc-400">
                            No messages received yet.
                        </CardContent>
                    </Card>
                ) : (
                    messages.map((msg) => (
                        <Card key={msg.id} className="bg-zinc-900/50 border-white/10 hover:border-cyan-500/30 transition-all">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center justify-between md:justify-start gap-4">
                                            <h3 className="text-xl font-semibold text-white">{msg.name}</h3>
                                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                                            <a href={`tel:${msg.phone}`} className="flex items-center hover:text-cyan-400 transition-colors">
                                                <Phone className="w-4 h-4 mr-2" />
                                                {msg.phone}
                                            </a>
                                            <a href={`mailto:${msg.email}`} className="flex items-center hover:text-cyan-400 transition-colors">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {msg.email}
                                            </a>
                                        </div>

                                        <p className="text-zinc-300 mt-4 bg-zinc-950/30 p-4 rounded-md border border-white/5 whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
                                    </div>

                                    <div className="flex items-start">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(msg.id)}
                                            className="p-3 rounded-md bg-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-colors border border-red-500/50 cursor-pointer"
                                            title="Delete Message"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
