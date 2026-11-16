'use client';

import { useSyncExternalStore } from 'react';
import Script from 'next/script';
import { CONSENT_EVENT, getConsent } from '@/lib/analytics/client';

function subscribe(onChange: () => void) {
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

const isAccepted = () => getConsent() === 'accepted';
const serverSnapshot = () => false;

/**
 * Optional Google Analytics 4. Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID
 * is set and the visitor accepted cookies, like ConsentedAdSenseScript. Our own
 * events are mirrored to it by lib/analytics/client.ts; none of them carry names.
 * Automatic page views are off: /s#<token> and /proof?d=... hold draw results,
 * so page views are sent by the mirror with the pathname only. In the GA4
 * property, also turn off enhanced measurement's "page changes based on
 * browser history events".
 */
export function ConsentedGoogleAnalytics({ measurementId }: { measurementId: string }) {
    const accepted = useSyncExternalStore(subscribe, isAccepted, serverSnapshot);
    if (!accepted || !/^G-[A-Z0-9]+$/.test(measurementId)) return null;

    return (
        <>
            <Script id="ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true,send_page_view:false,page_location:location.origin+location.pathname});gtag('event','page_view',{page_location:location.origin+location.pathname});`}
            </Script>
        </>
    );
}
