
"use client";

import { CapitalEntry, IncomeCategory } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { IncomeForm } from "./income-form";

interface IncomeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entry: CapitalEntry | null;
  categories: IncomeCategory[];
}

export function IncomeSheet({ isOpen, onOpenChange, entry, categories }: IncomeSheetProps) {
  const { t } = useTranslation();
  const title = entry ? t("income.editTitle") : t("income.addTitle");
  const description = entry ? t("income.editDescription") : t("income.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <IncomeForm entry={entry} categories={categories} onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
