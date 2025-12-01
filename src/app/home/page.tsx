
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { HomePageClient } from "@/components/home/home-page-client";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getStatsData } from "../stats/actions";
import { startOfDay, endOfDay } from "date-fns";

export default async function HomePage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const todayRange = { from: startOfDay(new Date()), to: endOfDay(new Date()) };
  const todayStats = await getStatsData(userId, todayRange);

  return (
    <AuthGuard>
      <MainLayout>
        <HomePageClient todayStats={todayStats} />
      </MainLayout>
    </AuthGuard>
  );
}
