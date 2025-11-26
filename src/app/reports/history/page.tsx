
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { SalesHistoryClient } from "@/components/reports/sales-history-client";
import { getSalesHistory } from "@/app/reports/actions";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";

export default async function SalesHistoryPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  // Fetch initial data for the last 30 days
  const { sales, error } = await getSalesHistory(userId, {
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
  });

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
