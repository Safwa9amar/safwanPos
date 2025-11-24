
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { StatsPageClient } from "@/components/stats/stats-page-client";
import { getStatsData } from "./actions";
import { subDays, startOfDay, endOfDay } from "date-fns";

export default async function StatsPage() {
  // Fetch initial data for the default view (e.g., last 7 days)
  const initialDateRange = { from: subDays(startOfDay(new Date()), 6), to: endOfDay(new Date()) };
  const initialStats = await getStatsData(initialDateRange);

  return (
    <AuthGuard>
      <MainLayout>
        <StatsPageClient initialStats={initialStats} />
      </MainLayout>
    </AuthGuard>
  );
}
