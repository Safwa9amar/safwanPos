
"use client";

import { useState } from "react";
import { PurchaseOrder as PurchaseOrderType, Supplier, Product } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Pencil } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SupplierSheet } from "./supplier-sheet";
import { PurchaseOrderSheet } from "./purchase-order-sheet";
import { PurchaseOrderList, PurchaseOrderWithItems } from "./purchase-order-list";
import { ProductWithCategoryAndBarcodes } from "@/types";

interface SupplierWithOrders extends Supplier {
    purchaseOrders: PurchaseOrderWithItems[];
}

interface SupplierDetailPageClientProps {
  initialSupplier: SupplierWithOrders;
  allProducts: ProductWithCategoryAndBarcodes[];
}

export function SupplierDetailPageClient({ initialSupplier, allProducts }: SupplierDetailPageClientProps) {
  const { t } = useTranslation();
  const [supplier, setSupplier] = useState<SupplierWithOrders>(initialSupplier);
  const [isSupplierSheetOpen, setIsSupplierSheetOpen] = useState(false);
  const [isPOSheetOpen, setIsPOSheetOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{supplier.name}</CardTitle>
              <CardDescription>{supplier.contactName}</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsSupplierSheetOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <div><span className="font-semibold">{t('suppliers.email')}: </span>{supplier.email || 'N/A'}</div>
            <div><span className="font-semibold">{t('suppliers.phone')}: </span>{supplier.phone || 'N/A'}</div>
            <div><span className="font-semibold">{t('suppliers.address')}: </span>{supplier.address || 'N/A'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t('suppliers.purchaseOrders')}</CardTitle>
            </div>
            <Button onClick={() => setIsPOSheetOpen(true)}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                {t('suppliers.createPurchaseOrder')}
            </Button>
        </CardHeader>
        <CardContent>
            <PurchaseOrderList purchaseOrders={supplier.purchaseOrders} />
        </CardContent>
      </Card>
      
      <SupplierSheet 
        isOpen={isSupplierSheetOpen}
        onOpenChange={setIsSupplierSheetOpen}
        supplier={supplier}
      />
      
      <PurchaseOrderSheet 
        isOpen={isPOSheetOpen}
        onOpenChange={setIsPOSheetOpen}
        supplierId={supplier.id}
        products={allProducts}
      />
    </div>
  );
}
