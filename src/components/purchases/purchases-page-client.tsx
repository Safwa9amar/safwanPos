
"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingCart, DollarSign, PackagePlus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { ProductWithCategoryAndBarcodes, DirectPurchase } from "@/types";
import { DirectPurchaseSheet } from "./direct-purchase-sheet";
import { PurchasesList } from "./purchases-list";
import { useCurrency } from "@/hooks/use-currency";

interface PurchasesPageClientProps {
  initialPurchases: DirectPurchase[];
  allProducts: ProductWithCategoryAndBarcodes[];
}

export function PurchasesPageClient({ initialPurchases, allProducts }: PurchasesPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const onSheetClose = () => {
    setIsSheetOpen(false);
    router.refresh();
  }

  const totalCost = initialPurchases.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{initialPurchases.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            </CardContent>
        </Card>
      </div>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><PackagePlus /> {t('purchases.title')}</CardTitle>
            <CardDescription>{t('purchases.description')}</CardDescription>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("purchases.log_purchase")}
          </Button>
        </CardHeader>
        <CardContent>
          <PurchasesList purchases={initialPurchases} />
        </CardContent>
      </Card>
      
      <DirectPurchaseSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        products={allProducts}
      />
    </div>
  );
}
