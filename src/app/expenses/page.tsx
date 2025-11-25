import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getExpenses, getExpenseCategories } from "./actions";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";

export default async function ExpensesPage() {
  const { expenses, error: expensesError } = await getExpenses();
  const { categories, error: categoriesError } = await getExpenseCategories();
  
  const error = expensesError || categoriesError;

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
          initialExpenses={expenses || []} 
          initialCategories={categories || []} 
        />
      </MainLayout>
    </AuthGuard>
  );
}
