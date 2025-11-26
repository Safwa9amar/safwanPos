
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { ReportHistoryClient } from "@/components/reports/report-history-client";

export default function AiHistoryPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ReportHistoryClient />
      </MainLayout>
    </AuthGuard>
  );
}
