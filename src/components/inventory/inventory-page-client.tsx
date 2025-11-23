"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { ProductTable } from "./product-table";
import { ProductSheet } from "./product-sheet";
import { useTranslation } from "@/hooks/use-translation";

export function InventoryPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setEditingProduct(null);
    setIsSheetOpen(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("inventory.title")}</CardTitle>
            <CardDescription>{t("inventory.description")}</CardDescription>
          </div>
          <Button onClick={handleAddProduct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("inventory.addProduct")}
          </Button>
        </CardHeader>
        <CardContent>
          <ProductTable products={products} onEdit={handleEditProduct} />
        </CardContent>
      </Card>

      <ProductSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        product={editingProduct}
      />
    </div>
  );
}
