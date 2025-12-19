"use client";

import { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdSenseProps {
    adSlot: string;
    adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Google AdSense Ad Component
 * 
 * Usage:
 * <AdSense adSlot="1234567890" adFormat="auto" />
 * 
 * Note: Replace 'ca-pub-XXXXXXXXXXXXXXXX' in layout.tsx with your actual AdSense Publisher ID
 */
export function AdSense({
    adSlot,
    adFormat = 'auto',
    fullWidthResponsive = true,
    style,
    className = ''
}: AdSenseProps) {
    useEffect(() => {
        try {
            // Push ad only if adsbygoogle is available
            if (typeof window !== 'undefined' && window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    return (
        <div className={`adsense-container ${className}`} style={style}>
            <ins
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
