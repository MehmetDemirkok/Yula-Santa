"use client";

import { useEffect, useState } from "react";
import { useToast, Toast } from "@/lib/ToastContext";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />,
    error: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />,
    info: <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500" />,
};

const barColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 3700);
        return () => clearTimeout(t);
    }, [toast.id, onDismiss]);

    const handleClose = () => {
        setLeaving(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={`
                relative flex items-start gap-3 w-full max-w-sm
                bg-white dark:bg-zinc-800
                border border-zinc-200 dark:border-zinc-700
                rounded-xl shadow-lg px-4 py-3 overflow-hidden
                transition-all duration-300 ease-out
                ${visible && !leaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `}
        >
            {icons[toast.type]}
            <p className="flex-1 text-sm text-zinc-800 dark:text-zinc-100 leading-snug pt-0.5">
                {toast.message}
            </p>
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mt-0.5"
            >
                <X className="w-4 h-4" />
            </button>
            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 ${barColors[toast.type]} animate-toast-shrink`} />
        </div>
    );
}

export function ToastContainer() {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto w-full max-w-sm">
                    <ToastItem toast={t} onDismiss={dismiss} />
                </div>
            ))}
        </div>
    );
}
