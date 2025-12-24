"use client";

import { useRouter, useParams } from "next/navigation";
import { Instagram, Youtube, Twitter, Gift } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-4 safe-area-inset-top pointer-events-none">
            {/* Left Side: Logo */}
            <div className="pointer-events-auto flex-shrink-0">
                <button
                    onClick={() => router.push(`/${locale}`)}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all"
                >
                    <Gift className="w-5 h-5 text-santa-red" strokeWidth={1.5} />
                    <span className="text-sm font-black tracking-tight text-gray-900 hidden md:inline">
                        Yula<span className="text-santa-red">Santa</span>
                    </span>
                </button>
            </div>

            {/* Center: Social/Giveaway Links */}
            <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 mx-2">
                <button
                    onClick={() => router.push(`/${locale}/instagram`)}
                    className="group bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-white/50 hover:scale-105 transition-all"
                    title="Instagram"
                >
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg">
                        <Instagram className="w-4 h-4 text-white" />
                    </div>
                </button>
                <button
                    onClick={() => router.push(`/${locale}/youtube`)}
                    className="group bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-white/50 hover:scale-105 transition-all"
                    title="YouTube"
                >
                    <div className="p-1.5 bg-red-600 rounded-lg">
                        <Youtube className="w-4 h-4 text-white" />
                    </div>
                </button>
                <button
                    onClick={() => router.push(`/${locale}/twitter`)}
                    className="group bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-white/50 hover:scale-105 transition-all"
                    title="Twitter"
                >
                    <div className="p-1.5 bg-black rounded-lg">
                        <Twitter className="w-4 h-4 text-white" />
                    </div>
                </button>
                <button
                    onClick={() => router.push(`/${locale}/tiktok`)}
                    className="group bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-white/50 hover:scale-105 transition-all"
                    title="TikTok"
                >
                    <div className="p-1.5 bg-black rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 text-white" fill="currentColor">
                            <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Right Side: Language Switcher */}
            <div className="pointer-events-auto flex-shrink-0">
                <LanguageSwitcher />
            </div>
        </nav>
    );
}
