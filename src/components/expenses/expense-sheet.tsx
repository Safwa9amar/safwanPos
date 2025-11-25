"use client";

import { Expense, ExpenseCategory } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { ExpenseForm } from "./expense-form";

interface ExpenseSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  categories: ExpenseCategory[];
}

export function ExpenseSheet({ isOpen, onOpenChange, expense, categories }: ExpenseSheetProps) {
  const { t } = useTranslation();
  const title = expense ? t("expenses.editTitle") : t("expenses.addTitle");
  const description = expense ? t("expenses.editDescription") : t("expenses.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ExpenseForm expense={expense} categories={categories} onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
