"use client";

import RaffleBoard from "@/components/RaffleBoard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TwitterClient() {
    const { t } = useLanguage();

    return (
        <RaffleBoard
            title={t.giveaway.twitterTitle}
            subtitle={t.giveaway.twitterDesc}
            icon={
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            }
            accentBox="bg-black dark:bg-gray-900 ring-1 ring-white/10"
            accentButton="bg-sky-500 hover:bg-sky-600"
            accentGlow="bg-sky-200 dark:bg-sky-500/20"
            placeholder="@kullanici"
            storageKey="twitter_raffle_draft"
            shareSuffix="🎰 www.yulasanta.com"
        />
    );
}
