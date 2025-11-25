"use client";

import { useState } from "react";
import { Expense, ExpenseCategory } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { deleteExpense } from "@/app/expenses/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "../ui/badge";

type ExpenseWithCategory = Expense & { category: ExpenseCategory };

interface ExpenseTableProps {
  expenses: ExpenseWithCategory[];
  onEdit: (expense: Expense) => void;
}

export function ExpenseTable({ expenses, onEdit }: ExpenseTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpense) return;
    setIsDeleting(true);
    const result = await deleteExpense(selectedExpense.id);
    setIsDeleting(false);
    if (result.success) {
      toast({ title: t('expenses.deleteSuccess') });
      setIsAlertOpen(false);
    } else {
      toast({ variant: 'destructive', title: t('expenses.deleteFailed'), description: result.error });
      setIsAlertOpen(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("expenses.noExpenses")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("expenses.date")}</TableHead>
            <TableHead>{t("expenses.descriptionLabel")}</TableHead>
            <TableHead>{t("expenses.category")}</TableHead>
            <TableHead className="text-right">{t("expenses.amount")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.expenseDate), "PP")}</TableCell>
              <TableCell className="font-medium">{expense.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{expense.category.name}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(expense.amount)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(expense)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(expense)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("inventory.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('expenses.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('expenses.deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('pos.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? t('inventory.saving') : t('inventory.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
