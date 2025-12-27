"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, X, Send, User, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SupportButton() {
    const t = useTranslations('support');
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleSend = () => {
        const emailSubject = `YulaSanta Destek Talebi - ${name}`;
        const emailBody = `Ad Soyad: ${name}\nE-posta: ${email}\nTelefon: ${phone}\n\nMesaj:\n${message}`;

        const mailtoLink = `mailto:mehmetdemirkok@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-[60]">
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-santa-red text-white rounded-full shadow-[0_8px_30px_rgb(239,68,68,0.4)] hover:shadow-[0_8px_30px_rgb(239,68,68,0.6)] transform hover:-translate-y-1 active:scale-95 transition-all duration-300 pointer-events-auto"
                    aria-label={t('button')}
                >
                    <div className="absolute inset-0 rounded-full bg-santa-red animate-ping opacity-20 pointer-events-none group-hover:hidden" />
                    <MessageSquare className="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            {/* Sidebar Drawer Container */}
            <div
                className={`fixed inset-0 z-[100] transition-opacity duration-500 ease-in-out ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                {/* Sidebar Content */}
                <div
                    className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-[#121212] shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-white/5 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    {/* Header */}
                    <div className="relative p-10 pt-16 flex-shrink-0">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-8 right-8 p-3 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        >
                            <X size={24} />
                        </button>

                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                {t('header')}
                            </h2>
                            <p className="text-gray-400 text-lg font-medium">
                                {t('subheader')}
                            </p>
                        </div>
                    </div>

                    {/* Form Body - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                        <div className="space-y-8">
                            {/* Name Field */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                                    <User size={14} className="text-santa-red" />
                                    {t('name')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('placeholderName')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-red/50 focus:border-santa-red transition-all font-medium"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                                    <Mail size={14} className="text-santa-red" />
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('placeholderEmail')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-red/50 focus:border-santa-red transition-all font-medium"
                                />
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                                    <Phone size={14} className="text-santa-red" />
                                    {t('phone')}
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={t('placeholderPhone')}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-red/50 focus:border-santa-red transition-all font-medium"
                                />
                            </div>

                            {/* Message Field */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                                    <MessageCircle size={14} className="text-santa-red" />
                                    {t('message')}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="..."
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-santa-red/50 focus:border-santa-red transition-all font-medium resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer / Submit Button */}
                    <div className="p-10 bg-white/[0.02] border-t border-white/5 flex-shrink-0">
                        <Button
                            onClick={handleSend}
                            className="w-full h-16 bg-santa-red hover:bg-red-600 text-white text-lg font-black tracking-tight rounded-2xl shadow-[0_8px_30px_rgb(239,68,68,0.3)] hover:shadow-[0_8px_30px_rgb(239,68,68,0.5)] transform active:scale-95 transition-all group"
                        >
                            <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            {t('send')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
