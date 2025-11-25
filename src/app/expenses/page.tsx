
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getExpenses, getExpenseCategories } from "./actions";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Expense, ExpenseCategory } from "@prisma/client";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<(Expense & { category: ExpenseCategory })[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const [expensesResult, categoriesResult] = await Promise.all([
          getExpenses(user.uid),
          getExpenseCategories(user.uid),
        ]);
        
        if (expensesResult.error || categoriesResult.error) {
          setError(expensesResult.error || categoriesResult.error || "Failed to load data");
        } else {
          // @ts-ignore
          setExpenses(expensesResult.expenses || []);
          setCategories(categoriesResult.categories || []);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Loading...</div>
        </MainLayout>
      </AuthGuard>
    );
  }
  
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
          initialExpenses={expenses} 
          initialCategories={categories} 
        />
      </MainLayout>
    </AuthGuard>
  );
}
