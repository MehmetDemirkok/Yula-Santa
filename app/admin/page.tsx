import { requireAdmin } from "@/lib/admin/guard";
import { RANGE_KEYS, type AdminData, type RangeKey } from "@/lib/admin/types";
import { getAdminData, isAnalyticsConfigured } from "@/lib/analytics/store";
import { getMembersData } from "@/lib/admin/members";
import { AdminDashboard } from "./AdminDashboard";

// Every request must pass the admin check, and admin data must never be cached.
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const { localBypass } = await requireAdmin();

    const { range: requested } = await searchParams;
    const range: RangeKey = RANGE_KEYS.includes(requested as RangeKey) ? (requested as RangeKey) : "30d";

    let data: AdminData | null = null;
    if (isAnalyticsConfigured()) {
        // The member list is loaded on its own, so a failure there does not blank the whole panel.
        const [stats, members] = await Promise.allSettled([getAdminData(range), getMembersData()]);
        if (stats.status === "fulfilled") {
            data = { ...stats.value, members: members.status === "fulfilled" ? members.value : null };
        } else {
            console.error("[admin] data load failed", stats.reason instanceof Error ? stats.reason.message : "unknown");
        }
        if (members.status === "rejected") {
            console.error("[admin] members load failed", members.reason instanceof Error ? members.reason.message : "unknown");
        }
    }

    return <AdminDashboard data={data} range={range} localBypass={localBypass} />;
}
