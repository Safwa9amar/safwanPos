
"use client";

import { Customer } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { CustomerForm } from "./customer-form";

interface CustomerSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerSheet({ isOpen, onOpenChange, customer }: CustomerSheetProps) {
  const { t } = useTranslation();
  const title = customer ? t("customers.editTitle") : t("customers.addTitle");
  const description = customer ? t("customers.editDescription") : t("customers.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <CustomerForm customer={customer} onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
