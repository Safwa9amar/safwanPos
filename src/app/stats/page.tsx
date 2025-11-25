
"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { StatsPageClient } from "@/components/stats/stats-page-client";

export default function StatsPage() {

  return (
    <AuthGuard>
      <MainLayout>
        <StatsPageClient />
      </MainLayout>
    </AuthGuard>
  );
}
