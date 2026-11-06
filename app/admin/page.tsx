import { requireAdmin } from "@/lib/admin/guard";
import { RANGE_KEYS, type AdminData, type RangeKey } from "@/lib/admin/types";
import { getAdminData, isAnalyticsConfigured } from "@/lib/analytics/store";
import { AdminDashboard } from "./AdminDashboard";

// Every request must pass the admin check, and admin data must never be cached.
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const { localBypass } = await requireAdmin();

    const { range: requested } = await searchParams;
    const range: RangeKey = RANGE_KEYS.includes(requested as RangeKey) ? (requested as RangeKey) : "30d";

    let data: AdminData | null = null;
    if (isAnalyticsConfigured()) {
        try {
            data = await getAdminData(range);
        } catch (error) {
            console.error("[admin] data load failed", error instanceof Error ? error.message : "unknown");
        }
    }

    return <AdminDashboard data={data} range={range} localBypass={localBypass} />;
}
