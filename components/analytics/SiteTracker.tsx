"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics/client";

// Module level, so React's double effect run in development counts one view.
let lastTrackedPath: string | null = null;

export function SiteTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (lastTrackedPath === pathname) return;
        lastTrackedPath = pathname;
        trackPageView();
    }, [pathname]);

    return null;
}
