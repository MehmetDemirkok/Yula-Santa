"use client";

import { useState } from "react";
import { X, Share2, ExternalLink } from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareText: string;
    shareUrl?: string;
    t: {
        shareResults?: string;
        shareOn?: string;
        shareTitle?: string;
        shareDesc?: string;
        close?: string;
    };
}

// Platform SVG icons
const TwitterXIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const RedditIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
);

interface SharePlatform {
    name: string;
    icon: React.ReactNode;
    color: string;
    hoverColor: string;
    getUrl: (text: string, url: string) => string;
}

export default function ShareModal({ isOpen, onClose, shareText, shareUrl, t }: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const currentUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href.replace(/localhost:\d+/, 'www.yulasanta.com.tr') : 'https://www.yulasanta.com.tr');

    const platforms: SharePlatform[] = [
        {
            name: "X (Twitter)",
            icon: <TwitterXIcon className="w-5 h-5" />,
            color: "bg-black dark:bg-white/10",
            hoverColor: "hover:bg-gray-800 dark:hover:bg-white/20",
            getUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        },
        {
            name: "WhatsApp",
            icon: <WhatsAppIcon className="w-5 h-5" />,
            color: "bg-[#25D366]",
            hoverColor: "hover:bg-[#20BD5A]",
            getUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`
        },
        {
            name: "Telegram",
            icon: <TelegramIcon className="w-5 h-5" />,
            color: "bg-[#0088CC]",
            hoverColor: "hover:bg-[#007AB8]",
            getUrl: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        },
        {
            name: "LinkedIn",
            icon: <LinkedInIcon className="w-5 h-5" />,
            color: "bg-[#0A66C2]",
            hoverColor: "hover:bg-[#004182]",
            getUrl: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        },
        {
            name: "Reddit",
            icon: <RedditIcon className="w-5 h-5" />,
            color: "bg-[#FF4500]",
            hoverColor: "hover:bg-[#E03D00]",
            getUrl: (text, url) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
        }
    ];

    const handleShare = (platform: SharePlatform) => {
        const url = platform.getUrl(shareText, currentUrl);
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareText + '\n\n' + currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1C1414] rounded-2xl shadow-[0_20px_60px_rgba(100,35,25,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[rgba(225,210,205,0.6)] dark:border-white/[0.07] w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[rgba(225,210,205,0.5)] dark:border-white/[0.07]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                            <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                {t.shareTitle || "Sonuçları Paylaş"}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t.shareDesc || "Çekiliş sonuçlarını paylaşın"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Platforms Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-3 gap-3">
                        {platforms.map((platform) => (
                            <button
                                key={platform.name}
                                onClick={() => handleShare(platform)}
                                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl ${platform.color} ${platform.hoverColor} text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg group`}
                            >
                                <div className="transform group-hover:scale-110 transition-transform duration-200">
                                    {platform.icon}
                                </div>
                                <span className="text-[11px] font-semibold tracking-wide opacity-90">
                                    {platform.name}
                                </span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity absolute top-2 right-2" />
                            </button>
                        ))}
                    </div>

                    {/* Copy Link Button */}
                    <div className="mt-4 pt-4 border-t border-[rgba(225,210,205,0.5)] dark:border-white/[0.07]">
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/14 rounded-xl text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 active:scale-[0.98]"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-600 dark:text-green-400">{t.close || "Kopyalandı!"}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    {t.shareResults || "Linki Kopyala"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
