import { requireAdmin } from "@/lib/admin/guard";
import { MarketingStudio } from "@/components/admin/marketing/MarketingStudio";

// Admin-only, never cached: requireAdmin() must run on every request.
export const dynamic = "force-dynamic";

export default async function MarketingPage() {
    await requireAdmin();
    return <MarketingStudio />;
}
