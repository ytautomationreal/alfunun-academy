"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export function CustomSelect({ options, value, onChange, placeholder = "Select...", label, required }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            {label && <label className="text-sm font-medium text-zinc-300">{label} {required && "*"}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-md border bg-zinc-950/50 px-3 py-2 text-sm transition-colors border-white/10 hover:border-cyan-500/50 ${isOpen ? "ring-2 ring-cyan-500 border-transparent" : ""} ${!selectedOption ? "text-zinc-500" : "text-zinc-200"}`}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full overflow-hidden rounded-md border border-white/10 bg-zinc-900 shadow-xl"
                    >
                        <ul className="max-h-[200px] overflow-y-auto py-1">
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-cyan-500/20 hover:text-cyan-400 ${value === option.value ? "bg-cyan-500/10 text-cyan-400" : "text-zinc-300"}`}
                                >
                                    <span className="flex-1 truncate px-2">{option.label}</span>
                                    {value === option.value && (
                                        <span className="flex items-center justify-center w-4 h-4 mr-2">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
