
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Pencil, DollarSign, Receipt, History } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { CustomerSheet } from "./customer-sheet";
import { CustomerWithDetails } from "@/types";
import { Separator } from "../ui/separator";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "../ui/badge";
import { PaymentSheet } from "./payment-sheet";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";

export function CustomerDetailPageClient({ initialCustomer }: { initialCustomer: CustomerWithDetails }) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [customer, setCustomer] = useState<CustomerWithDetails>(initialCustomer);
  const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CREDIT': return 'destructive';
      case 'CARD': return 'secondary';
      case 'CASH':
      default:
        return 'outline';
    }
  };

  const sortedHistory = [
    ...customer.sales.map(s => ({ type: 'sale' as const, date: s.saleDate, data: s })),
    ...customer.payments.map(p => ({ type: 'payment' as const, date: p.paymentDate, data: p }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 md:p-6 grid gap-6 md:grid-cols-3">
      {/* Left Column */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{customer.name}</CardTitle>
                <CardDescription>{t('customers.customerDetails')}</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={() => setIsCustomerSheetOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
              <div><span className="font-semibold">{t('customers.phone')}: </span>{customer.phone || 'N/A'}</div>
              <div><span className="font-semibold">{t('customers.email')}: </span>{customer.email || 'N/A'}</div>
              <div><span className="font-semibold">{t('customers.address')}: </span>{customer.address || 'N/A'}</div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>{t('customers.balance')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn(
                    "text-4xl font-bold",
                    customer.balance > 0 ? "text-destructive" : "text-green-600"
                )}>{formatCurrency(customer.balance)}</p>
                <p className="text-xs text-muted-foreground">
                    {customer.balance > 0 ? t('customers.amountDue') : t('customers.paidInFull')}
                </p>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={() => setIsPaymentSheetOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    {t('customers.addPayment')}
                </Button>
            </CardFooter>
        </Card>
      </div>

      {/* Right Column */}
      <div className="md:col-span-2">
         <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('customers.transactionHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                    {sortedHistory.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">{t('customers.noTransactions')}</p>
                    ) : sortedHistory.map((entry, index) => (
                        <Card key={index}>
                           {entry.type === 'sale' && (
                                <>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Receipt /> {t('customers.sale')} #{entry.data.id.substring(0,8)}
                                        </CardTitle>
                                        <Badge variant={getStatusVariant(entry.data.paymentType)}>{entry.data.paymentType}</Badge>
                                    </div>
                                    <CardDescription>{format(new Date(entry.date), "PPP p")}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 text-sm">
                                        {entry.data.items.map(item => (
                                            <div key={item.id} className="flex justify-between">
                                                <span>{item.product.name} (x{item.quantity})</span>
                                                <span>{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end font-bold text-lg">
                                    {t('pos.total')}: {formatCurrency(entry.data.totalAmount)}
                                </CardFooter>
                                </>
                           )}
                           {entry.type === 'payment' && (
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <DollarSign /> {t('customers.paymentReceived')}
                                        </CardTitle>
                                        <span className="font-bold text-green-600 text-lg">{formatCurrency(entry.data.amount)}</span>
                                    </div>
                                    <CardDescription>{format(new Date(entry.date), "PPP p")}</CardDescription>
                                     {entry.data.notes && <p className="text-sm text-muted-foreground pt-2">Notes: {entry.data.notes}</p>}
                                </CardHeader>
                           )}
                        </Card>
                    ))}
                </div>
                </ScrollArea>
            </CardContent>
         </Card>
      </div>

      <CustomerSheet 
        isOpen={isCustomerSheetOpen}
        onOpenChange={setIsCustomerSheetOpen}
        customer={customer}
      />
      
      <PaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={setIsPaymentSheetOpen}
        customer={customer}
      />
    </div>
  );
}
