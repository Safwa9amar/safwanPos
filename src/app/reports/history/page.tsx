
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { SalesHistoryClient } from "@/components/reports/sales-history-client";
import { useAuth } from "@/context/auth-context";

export default function SalesHistoryPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <MainLayout>
        <SalesHistoryClient />
      </MainLayout>
    </AuthGuard>
  );
}
