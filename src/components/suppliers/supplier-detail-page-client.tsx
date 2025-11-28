
"use client";

import { useState } from "react";
import { PurchaseOrder as PurchaseOrderType, Supplier, Product, SupplierPayment, SupplierCredit } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Pencil, DollarSign, HandCoins } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SupplierSheet } from "./supplier-sheet";
import { PurchaseOrderSheet } from "./purchase-order-sheet";
import { PurchaseOrderList, PurchaseOrderWithItems } from "./purchase-order-list";
import { ProductWithCategoryAndBarcodes } from "@/types";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import { SupplierPaymentSheet } from "./supplier-payment-sheet";
import { SupplierCreditSheet } from "./supplier-credit-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

interface SupplierWithDetails extends Supplier {
    purchaseOrders: PurchaseOrderWithItems[];
    payments: SupplierPayment[];
    credits: SupplierCredit[];
}

interface SupplierDetailPageClientProps {
  initialSupplier: SupplierWithDetails;
  allProducts: ProductWithCategoryAndBarcodes[];
}

export function SupplierDetailPageClient({ initialSupplier, allProducts }: SupplierDetailPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [supplier, setSupplier] = useState<SupplierWithDetails>(initialSupplier);
  const [isSupplierSheetOpen, setIsSupplierSheetOpen] = useState(false);
  const [isPOSheetOpen, setIsPOSheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isCreditSheetOpen, setIsCreditSheetOpen] = useState(false);

  const sortedHistory = [
    ...supplier.purchaseOrders.map(po => ({ type: 'purchase' as const, date: po.orderDate, data: po })),
    ...supplier.payments.map(p => ({ type: 'payment' as const, date: p.paymentDate, data: p })),
    ...supplier.credits.map(c => ({ type: 'credit' as const, date: c.adjustmentDate, data: c }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleSheetChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (open: boolean) => {
      setter(open);
      if (!open) {
          router.refresh();
      }
  }


  return (
    <div className="p-4 md:p-6 grid gap-6 md:grid-cols-3">
        {/* Left Column */}
      <div className="md:col-span-1 space-y-6">
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
          <CardContent className="grid md:grid-cols-1 gap-4 text-sm">
              <div><span className="font-semibold">{t('suppliers.email')}: </span>{supplier.email || 'N/A'}</div>
              <div><span className="font-semibold">{t('suppliers.phone')}: </span>{supplier.phone || 'N/A'}</div>
              <div><span className="font-semibold">{t('suppliers.address')}: </span>{supplier.address || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Balance</CardTitle>
                <CardDescription>Amount you owe this supplier.</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className={cn(
                    "text-4xl font-bold",
                    supplier.balance > 0 ? "text-destructive" : "text-green-600"
                )}>{formatCurrency(supplier.balance)}</p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                 <Button className="w-full" onClick={() => setIsPaymentSheetOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Make Payment
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => setIsCreditSheetOpen(true)}>
                    <HandCoins className="mr-2 h-4 w-4" />
                    Add Credit/Debt
                </Button>
            </CardFooter>
        </Card>

      </div>
        {/* Right Column */}
        <div className="md:col-span-2">
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
                    <Tabs defaultValue="history">
                        <TabsList>
                            <TabsTrigger value="history">Transaction History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="history">
                            <PurchaseOrderList purchaseOrders={sortedHistory} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
      
      <SupplierSheet 
        isOpen={isSupplierSheetOpen}
        onOpenChange={handleSheetChange(setIsSupplierSheetOpen)}
        supplier={supplier}
      />
      
      <PurchaseOrderSheet 
        isOpen={isPOSheetOpen}
        onOpenChange={handleSheetChange(setIsPOSheetOpen)}
        supplierId={supplier.id}
        products={allProducts}
      />

      <SupplierPaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={handleSheetChange(setIsPaymentSheetOpen)}
        supplier={supplier}
      />
      
      <SupplierCreditSheet
        isOpen={isCreditSheetOpen}
        onOpenChange={handleSheetChange(setIsCreditSheetOpen)}
        supplier={supplier}
      />
    </div>
  );
}
