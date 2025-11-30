
"use client";

import { Supplier } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { SupplierForm } from "./supplier-form";
import { ScrollArea } from "../ui/scroll-area";

interface SupplierDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function SupplierSheet({ isOpen, onOpenChange, supplier }: SupplierDialogProps) {
  const { t } = useTranslation();
  const title = supplier ? t("suppliers.editTitle") : t("suppliers.addTitle");
  const description = supplier ? t("suppliers.editDescription") : t("suppliers.addDescription");
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-hidden pr-2">
            <ScrollArea className="h-full pr-4">
                <SupplierForm supplier={supplier} onFinished={() => onOpenChange(false)} />
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
