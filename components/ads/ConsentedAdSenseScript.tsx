'use client';

import { useSyncExternalStore } from 'react';
import Script from 'next/script';
import { CONSENT_EVENT, getConsent } from '@/lib/analytics/client';

function subscribe(onChange: () => void) {
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

const isAccepted = () => getConsent() === 'accepted';
// The server never knows the visitor's choice, so it never renders the script.
const serverSnapshot = () => false;

/**
 * Loads the AdSense script only after the visitor accepts cookies, as the
 * cookie banner and privacy notice promise. Declining, or not answering yet,
 * means Google's script never loads and sets no cookies.
 *
 * The `google-adsense-account` meta tag in the layout is separate and stays,
 * so site verification for AdSense approval keeps working.
 */
export function ConsentedAdSenseScript({ clientId }: { clientId: string }) {
    const accepted = useSyncExternalStore(subscribe, isAccepted, serverSnapshot);
    if (!accepted) return null;

    return (
        <Script
            id="adsense-script"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
