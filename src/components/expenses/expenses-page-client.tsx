"use client";

import { useState } from "react";
import { Expense, ExpenseCategory } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Folder } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTable } from "./expense-table";
import { ExpenseCategoryManager } from "./expense-category-manager";
import { ExpenseSheet } from "./expense-sheet";

interface ExpensesPageClientProps {
  initialExpenses: (Expense & { category: ExpenseCategory })[];
  initialCategories: ExpenseCategory[];
}

export function ExpensesPageClient({ initialExpenses, initialCategories }: ExpensesPageClientProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsSheetOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsSheetOpen(true);
  };

  const onSheetClose = () => {
    setEditingExpense(null);
    setIsSheetOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("expenses.title")}</CardTitle>
            <CardDescription>{t("expenses.description")}</CardDescription>
          </div>
          <Button onClick={handleAddExpense}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("expenses.add")}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expenses">
            <TabsList>
              <TabsTrigger value="expenses">{t('expenses.title')}</TabsTrigger>
              <TabsTrigger value="categories">{t('expenses.manageCategories')}</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses" className="pt-4">
              <ExpenseTable
                expenses={initialExpenses}
                onEdit={handleEditExpense}
              />
            </TabsContent>
            <TabsContent value="categories" className="pt-4">
              <ExpenseCategoryManager initialCategories={initialCategories} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <ExpenseSheet 
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        expense={editingExpense}
        categories={initialCategories}
      />
    </div>
  );
}
