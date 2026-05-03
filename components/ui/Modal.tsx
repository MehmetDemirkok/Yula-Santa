"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        >
            <div className="w-full max-w-lg bg-white dark:bg-[#1C1414] border border-gray-100 dark:border-white/8 rounded-2xl shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/8">
                    <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto text-gray-700 dark:text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
}
