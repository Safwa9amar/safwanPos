
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { SalesHistoryClient } from "@/components/reports/sales-history-client";
import { getSalesHistory } from "@/app/reports/actions";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function SalesHistoryPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const { sales, error } = await getSalesHistory(userId);

  return (
    <AuthGuard>
      <MainLayout>
        {error ? (
          <div className="p-4 text-destructive">{error}</div>
        ) : (
          <SalesHistoryClient initialSales={sales || []} />
        )}
      </MainLayout>
    </AuthGuard>
  );
}
