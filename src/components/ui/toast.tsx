"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error";
}

const ToastContext = createContext<{ showToast: (msg: string, type: "success" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: "success" | "error") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center gap-2 p-4 rounded-lg shadow-lg text-white border ${toast.type === "success"
                                ? "bg-zinc-900 border-green-500/20"
                                : "bg-zinc-900 border-red-500/20"
                                }`}
                        >
                            {toast.type === "success" ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <p className="text-sm font-medium">{String(toast.message)}</p>
                            <button onClick={() => removeToast(toast.id)} className="ml-2">
                                <X className="w-4 h-4 text-zinc-500 hover:text-white" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
