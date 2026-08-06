"use client";

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

interface AdSenseProps {
    adSlot: string;
    adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

function hasAdLoaded(el: HTMLElement): boolean {
    // AdSense marks filled units; also guard if an iframe was already injected.
    return (
        el.getAttribute('data-adsbygoogle-status') === 'done' ||
        el.getAttribute('data-ad-status') === 'filled' ||
        el.dataset.adInitialized === 'true' ||
        el.querySelector('iframe') !== null
    );
}

/**
 * Google AdSense Ad Component
 *
 * Pushes a fill request once per <ins> element. Guards against React Strict Mode
 * double-effects and client navigations that remount the same slot.
 */
export function AdSense({
    adSlot,
    adFormat = 'auto',
    fullWidthResponsive = true,
    style,
    className = ''
}: AdSenseProps) {
    const insRef = useRef<HTMLModElement>(null);
    const pushedRef = useRef(false);

    useEffect(() => {
        const el = insRef.current;
        if (!el || pushedRef.current || hasAdLoaded(el)) {
            return;
        }

        // Mark before push so a Strict Mode re-run / concurrent effect won't double-fill.
        el.dataset.adInitialized = 'true';
        pushedRef.current = true;

        try {
            if (typeof window === 'undefined') return;
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch (error) {
            // Allow a later remount with a fresh <ins> to retry if this push failed.
            pushedRef.current = false;
            delete el.dataset.adInitialized;

            const message = error instanceof Error ? error.message : String(error);
            // Benign when every visible unit is already filled (common in Strict Mode / HMR).
            if (/already have ads/i.test(message)) {
                return;
            }
            console.error('AdSense error:', error);
        }
    }, [adSlot]);

    return (
        <div className={`adsense-container ${className}`} style={style}>
            <ins
                ref={insRef}
                key={adSlot}
                className="adsbygoogle"
                style={{
                    display: 'block',
                    ...style
                }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-1407870205867199'}
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
            />
        </div>
    );
}

/**
 * Banner Ad - Horizontal ad for top/bottom of page
 */
export function BannerAd({ adSlot, className = '' }: { adSlot: string; className?: string }) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="horizontal"
            className={`banner-ad ${className}`}
            style={{ minHeight: '90px' }}
        />
    );
}

/**
 * Rectangle Ad - For sidebar or in-content
 */
export function RectangleAd({ adSlot, className = '' }: { adSlot: string; className?: string }) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="rectangle"
            className={`rectangle-ad ${className}`}
            style={{ minHeight: '250px', minWidth: '300px' }}
        />
    );
}

/**
 * In-Article Ad - Native ad that blends with content
 */
export function InArticleAd({ adSlot, className = '' }: { adSlot: string; className?: string }) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="fluid"
            className={`in-article-ad ${className}`}
            style={{ minHeight: '100px' }}
        />
    );
}

/**
 * Auto Ad - Responsive ad that automatically adjusts size
 */
export function AutoAd({ adSlot, className = '' }: { adSlot: string; className?: string }) {
    return (
        <AdSense
            adSlot={adSlot}
            adFormat="auto"
            fullWidthResponsive={true}
            className={`auto-ad ${className}`}
        />
    );
}
