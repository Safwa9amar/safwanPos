
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getExpenses, getExpenseCategories } from "./actions";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";
import { getAdminAuth } from "@/lib/firebase-admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getUserId() {
    const auth = getAdminAuth();
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return null;
    }
}

export default async function ExpensesPage() {
  const userId = await getUserId();
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
