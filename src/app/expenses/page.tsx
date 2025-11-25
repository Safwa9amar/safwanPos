
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getExpenses, getExpenseCategories } from "./actions";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";

export default async function ExpensesPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const [expensesResult, categoriesResult] = await Promise.all([
    getExpenses(userId),
    getExpenseCategories(userId),
  ]);
  
  const error = expensesResult.error || categoriesResult.error;

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading data: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <ExpensesPageClient 
          initialExpenses={expensesResult.expenses || []} 
          initialCategories={categoriesResult.categories || []} 
        />
      </MainLayout>
    </AuthGuard>
  );
}
