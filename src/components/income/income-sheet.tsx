
"use client";

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
}

export function IncomeSheet({ isOpen, onOpenChange }: IncomeSheetProps) {
  const { t } = useTranslation();
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("income.addTitle")}</SheetTitle>
          <SheetDescription>{t("income.addDescription")}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <IncomeForm onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
