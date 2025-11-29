
"use client";

import { useState } from "react";
import { CapitalEntry } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { deleteCapitalEntry } from "@/app/income/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";

interface IncomeTableProps {
  entries: CapitalEntry[];
}

export function IncomeTable({ entries }: IncomeTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CapitalEntry | null>(null);

  const handleDeleteClick = (entry: CapitalEntry) => {
    setSelectedEntry(entry);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntry) return;
    setIsDeleting(true);
    const result = await deleteCapitalEntry(selectedEntry.id);
    setIsDeleting(false);
    if (result.success) {
      toast({ title: t('income.deleteSuccess') });
      setIsAlertOpen(false);
    } else {
      toast({ variant: 'destructive', title: t('income.deleteFailed'), description: result.error });
      setIsAlertOpen(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("income.noEntries")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("income.date")}</TableHead>
            <TableHead>{t("income.details")}</TableHead>
            <TableHead className="text-right">{t("income.amount")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{format(new Date(entry.entryDate), "PP")}</TableCell>
              <TableCell className="font-medium">{entry.details}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(entry.amount)}</TableCell>
              <TableCell className="text-right">
                 <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('income.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('income.deleteConfirmDescription')}</AlertDialogDescription>
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
