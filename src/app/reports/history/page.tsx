import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSalesHistory } from "../actions";
import { SalesHistoryClient } from "@/components/reports/sales-history-client";
import { endOfDay, startOfDay, subDays } from "date-fns";

export default async function SalesHistoryPage() {
  const defaultDateRange = { from: subDays(new Date(), 7), to: new Date() };

  const { sales, error } = await getSalesHistory({
      dateFrom: startOfDay(defaultDateRange.from),
      dateTo: endOfDay(defaultDateRange.to),
  });

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <SalesHistoryClient initialSales={sales || []} />
      </MainLayout>
    </AuthGuard>
  );
}
