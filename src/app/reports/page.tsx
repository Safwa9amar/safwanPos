import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { ReportsPageClient } from "@/components/reports/reports-page-client";

export default function ReportsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ReportsPageClient />
      </MainLayout>
    </AuthGuard>
  );
}
