import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { parseBrowser } from "@/lib/analytics/events";
import { isAnalyticsConfigured, recordAdminAccess } from "@/lib/analytics/store";
import { rateLimit } from "@/lib/rateLimit";
import { isAdminSession } from "./access";

export type AdminAccess = { localBypass: boolean };

async function audit(requestHeaders: Headers, entry: { outcome: "allowed" | "denied"; event: string; account: string }) {
    if (!isAnalyticsConfigured()) return;
    if (entry.outcome === "denied") {
        // Repeated hits on a closed page must not become unlimited database writes.
        const probe = new Request("http://internal/admin", { headers: requestHeaders });
        if (!rateLimit(probe, "admin-denied").allowed) return;
    }
    try {
        const country = requestHeaders.get("x-vercel-ip-country");
        await recordAdminAccess({
            ...entry,
            country: country && /^[A-Z]{2}$/.test(country) ? country : null,
            browser: parseBrowser(requestHeaders.get("user-agent") ?? ""),
        });
    } catch {
        // A failed audit write must not open or break the gate.
    }
}

/**
 * Call first in everything under /admin. Anyone who is not the allowlisted
 * admin gets the same 404 as a page that does not exist.
 *
 * ADMIN_DEV_BYPASS only works under `next dev` and exists so the panel can be
 * opened on localhost. Production builds always run the full check.
 */
export async function requireAdmin(): Promise<AdminAccess> {
    if (process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_BYPASS === "1") {
        return { localBypass: true };
    }

    const session = await auth();
    const requestHeaders = await headers();
    const allowed = isAdminSession(
        session ? { email: session.user?.email, emailVerified: session.emailVerified, authAt: session.authAt } : null,
        process.env.ADMIN_EMAILS,
        Math.floor(Date.now() / 1000),
    );

    if (!allowed) {
        await audit(requestHeaders, {
            outcome: "denied",
            event: session ? "İzinsiz hesap veya süresi dolmuş oturum" : "Oturumsuz istek",
            account: session ? "İzin listesinde olmayan oturum" : "Oturum yok",
        });
        notFound();
    }

    await audit(requestHeaders, { outcome: "allowed", event: "Panele giriş", account: "İzinli admin hesabı" });
    return { localBypass: false };
}
