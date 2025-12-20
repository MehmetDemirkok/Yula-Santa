"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MessageCircle, X, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SupportButton() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSendEmail = () => {
        const emailSubject = subject || "Support Request";
        const emailBody = message;

        // Construct mailto link
        const mailtoLink = `mailto:mehmetdemirkok@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Open default mail client
        window.location.href = mailtoLink;
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-40">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="shadow-lg flex items-center gap-2 rounded-full h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <MessageCircle size={20} />
                    <span className="hidden sm:inline">{t.support.button}</span>
                </Button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        {/* Header */}
                        <div className="bg-blue-600 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <MessageCircle size={24} className="text-blue-200" />
                                        {t.support.title}
                                    </h3>
                                    <p className="text-blue-100 text-sm mt-1 opacity-90">
                                        {t.support.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Contact Info */}
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm border border-blue-100">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">{t.support.contact}</div>
                                    <div className="font-semibold text-gray-900 break-all">mehmetdemirkok@gmail.com</div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.support.subject}</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Feedback / Öneri / Hata Bildirimi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.support.message}</label>
                                    <textarea
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="..."
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSendEmail}
                                className="w-full flex justify-center items-center gap-2 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all transform active:scale-95"
                            >
                                <Send size={20} />
                                {t.support.send}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
