
"use client";

import { Product, Category } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductForm } from "./product-form";
import { useTranslation } from "@/hooks/use-translation";
import { ProductWithCategoryAndBarcodes } from "@/types";

interface ProductSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithCategoryAndBarcodes | null;
  categories: Category[];
}

export function ProductSheet({ isOpen, onOpenChange, product, categories }: ProductSheetProps) {
  const { t } = useTranslation();
  const title = product ? t("inventory.editTitle") : t("inventory.addProduct");
  const description = product ? t("inventory.editDescription") : t("inventory.addDescription");
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ProductForm product={product} categories={categories} onFinished={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
