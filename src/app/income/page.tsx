
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getIncomeEntries, getIncomeCategories } from "./actions";
import { IncomePageClient } from "@/components/income/income-page-client";


export default async function IncomePage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const [entriesResult, categoriesResult] = await Promise.all([
    getIncomeEntries(userId),
    getIncomeCategories(userId),
  ]);

  const error = entriesResult.error || categoriesResult.error;

  return (
    <AuthGuard>
      <MainLayout>
        {error ? (
          <div className="p-4 text-destructive">{error}</div>
        ) : (
          <IncomePageClient 
            initialEntries={entriesResult.entries || []} 
            initialCategories={categoriesResult.categories || []}
          />
        )}
      </MainLayout>
    </AuthGuard>
  );
}
