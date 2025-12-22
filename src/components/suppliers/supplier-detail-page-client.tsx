
"use client";

import { useState, useEffect } from "react";
import { PurchaseOrder as PurchaseOrderType, Supplier, Product, SupplierPayment, SupplierCredit } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Pencil, DollarSign, HandCoins, Truck, Contact, Info, MoreVertical } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SupplierSheet } from "./supplier-sheet";
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
import Image from "next/image";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

interface SupplierWithDetails extends Supplier {
    purchaseOrders: PurchaseOrderWithItems[];
    payments: SupplierPayment[];
    credits: SupplierCredit[];
}

interface SupplierDetailPageClientProps {
  initialSupplier: SupplierWithDetails;
  allProducts: ProductWithCategoryAndBarcodes[];
}

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const DetailItem = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value || 'N/A'}</p>
    </div>
);

export function SupplierDetailPageClient({ initialSupplier, allProducts }: SupplierDetailPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [supplier, setSupplier] = useState<SupplierWithDetails>(initialSupplier);
  
  const [isSupplierSheetOpen, setIsSupplierSheetOpen] = useState(false);
  
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SupplierPayment | null>(null);

  const [isCreditSheetOpen, setIsCreditSheetOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<SupplierCredit | null>(null);


  useEffect(() => {
    setSupplier(initialSupplier);
  }, [initialSupplier]);

  const handleSheetChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (open: boolean) => {
      setter(open);
      if (!open) {
          router.refresh();
      }
  }

  const handleEditPayment = (payment: SupplierPayment) => {
      setEditingPayment(payment);
      setIsPaymentSheetOpen(true);
  }
  
  const handleEditCredit = (credit: SupplierCredit) => {
      setEditingCredit(credit);
      setIsCreditSheetOpen(true);
  }

  const sortedHistory = [
    ...(supplier.purchaseOrders || []).map(po => ({ type: 'purchase' as const, date: po.orderDate, data: po })),
    ...(supplier.payments || []).map(p => ({ type: 'payment' as const, date: p.paymentDate, data: p })),
    ...(supplier.credits || []).map(c => ({ type: 'credit' as const, date: c.adjustmentDate, data: c }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPurchaseValue = supplier.purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0);
  const totalPayments = supplier.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                    {supplier.logoUrl ? (
                        <Image src={supplier.logoUrl} alt={supplier.name} fill className="rounded-lg object-contain bg-muted" />
                    ) : (
                        <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
                            <Truck className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-3xl">{supplier.name}</CardTitle>
                         <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>{supplier.status}</Badge>
                    </div>
                    <CardDescription className="mt-1">{supplier.category || "Supplier"}</CardDescription>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                 <Button onClick={() => router.push('/suppliers/new-purchase-order')}>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    {t('suppliers.createPurchaseOrder')}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <MoreVertical className="mr-2 h-4 w-4" /> {t('actions.actions')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => { setEditingPayment(null); setIsPaymentSheetOpen(true);}}>
                            <DollarSign className="mr-2 h-4 w-4"/> {t('actions.make_payment')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setEditingCredit(null); setIsCreditSheetOpen(true);}}>
                             <HandCoins className="mr-2 h-4 w-4"/> {t('actions.add_credit_debt')}
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setIsSupplierSheetOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4"/> {t('actions.edit')} {t('suppliers.title')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
          <StatCard title={t('suppliers.balanceDue')} value={formatCurrency(supplier.balance)} icon={<DollarSign className={cn("h-4 w-4", supplier.balance > 0 ? "text-destructive" : "text-green-600")} />} />
          <StatCard title={t('suppliers.totalPurchaseValue')} value={formatCurrency(totalPurchaseValue)} icon={<Truck className="h-4 w-4 text-muted-foreground"/>} />
          <StatCard title={t('suppliers.totalPaid')} value={formatCurrency(totalPayments)} icon={<HandCoins className="h-4 w-4 text-muted-foreground"/>} />
      </div>

      <Card>
        <CardContent className="p-0">
            <Tabs defaultValue="history">
                <div className="p-4 border-b">
                    <TabsList>
                        <TabsTrigger value="history">{t('suppliers.history')}</TabsTrigger>
                        <TabsTrigger value="profile">{t('suppliers.profile')}</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="history" className="p-4 md:p-6">
                    <PurchaseOrderList 
                        purchaseOrders={sortedHistory} 
                        onEditPayment={handleEditPayment}
                        onEditCredit={handleEditCredit}
                    />
                </TabsContent>
                <TabsContent value="profile" className="p-4 md:p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Contact /> {t('suppliers.contactInfo')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DetailItem label={t('suppliers.contactName')} value={supplier.contactName} />
                                <DetailItem label={t('suppliers.email')} value={supplier.email} />
                                <DetailItem label={t('suppliers.phone')} value={supplier.phone} />
                                <DetailItem label={t('suppliers.address')} value={supplier.address} />
                                <DetailItem label={t('suppliers.commChannel')} value={supplier.communicationChannel} />
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Info /> {t('suppliers.businessInfo')}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DetailItem label={t('suppliers.taxId')} value={supplier.taxId} />
                                <DetailItem label={t('suppliers.paymentTerms')} value={supplier.paymentTerms} />
                                <DetailItem label={t('suppliers.deliverySchedule')} value={supplier.deliverySchedule} />
                                <DetailItem label={t('suppliers.contractStart')} value={supplier.contractStartDate ? format(new Date(supplier.contractStartDate), 'PPP') : 'N/A'} />
                                <DetailItem label={t('suppliers.contractEnd')} value={supplier.contractEndDate ? format(new Date(supplier.contractEndDate), 'PPP') : 'N/A'} />
                                <DetailItem label={t('suppliers.qualityRating')} value={supplier.qualityRating ? `${supplier.qualityRating} / 5` : 'N/A'} />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      <SupplierSheet 
        isOpen={isSupplierSheetOpen}
        onOpenChange={handleSheetChange(setIsSupplierSheetOpen)}
        supplier={supplier}
      />

      <SupplierPaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={handleSheetChange(setIsPaymentSheetOpen)}
        supplier={supplier}
        payment={editingPayment}
      />
      
      <SupplierCreditSheet
        isOpen={isCreditSheetOpen}
        onOpenChange={handleSheetChange(setIsCreditSheetOpen)}
        supplier={supplier}
        credit={editingCredit}
      />
    </div>
  );
}
