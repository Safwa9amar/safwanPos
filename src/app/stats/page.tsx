import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { StatsPageClient } from "@/components/stats/stats-page-client";
import { getStatsData } from "./actions";

export default async function StatsPage() {
  const initialStats = await getStatsData();

  return (
    <AuthGuard>
      <MainLayout>
        <StatsPageClient initialStats={initialStats} />
      </MainLayout>
    </AuthGuard>
  );
}
