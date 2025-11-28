
"use client";

import { Supplier } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { SupplierForm } from "./supplier-form";
import { ScrollArea } from "../ui/scroll-area";

interface SupplierSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function SupplierSheet({ isOpen, onOpenChange, supplier }: SupplierSheetProps) {
  const { t } = useTranslation();
  const title = supplier ? t("suppliers.editTitle") : t("suppliers.addTitle");
  const description = supplier ? t("suppliers.editDescription") : t("suppliers.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="py-4 pr-6">
                <SupplierForm supplier={supplier} onFinished={() => onOpenChange(false)} />
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
