"use client";

import { useState } from "react";
import { Product, Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Folder } from "lucide-react";
import { ProductTable } from "./product-table";
import { ProductSheet } from "./product-sheet";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { ProductWithCategory } from "@/types";

export function InventoryPageClient({ initialProducts, categories }: { initialProducts: ProductWithCategory[], categories: Category[] }) {
  const { t } = useTranslation();
  const router = useRouter();
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/inventory/categories')}>
                <Folder className="mr-2 h-4 w-4" />
                {t('inventory.manageCategories')}
            </Button>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("inventory.addProduct")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable products={initialProducts} onEdit={handleEditProduct} />
        </CardContent>
      </Card>

      <ProductSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}
