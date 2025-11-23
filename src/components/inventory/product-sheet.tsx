"use client";

import { Product } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductForm } from "./product-form";
import { useTranslation } from "@/hooks/use-translation";

interface ProductSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductSheet({ isOpen, onOpenChange, product }: ProductSheetProps) {
  const { t } = useTranslation();
  const title = product ? t("inventory.editTitle") : t("inventory.addProduct");
  const description = product ? t("inventory.editDescription") : t("inventory.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ProductForm product={product} onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
