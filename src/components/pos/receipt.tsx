
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "../icons";
import { Printer, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Sale } from "@/types";
import { useCurrency } from "@/hooks/use-currency";
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

type ReceiptProps = {
  sale: Sale;
  onDone: () => void;
};

export function Receipt({ sale, onDone }: ReceiptProps) {
  const { t } = useTranslation("translation");
  const { formatCurrency } = useCurrency();
  const receiptRef = useRef(null);

  const companyProfile = sale.user?.companyProfile;
  const finalTotal = sale.totalAmount - sale.discount;
  const balance = finalTotal - sale.amountPaid;

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-Sale-${sale.id.substring(0,8)}`,
    onAfterPrint: () => onDone()
  });

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/40 min-h-screen">
      <div className="fixed top-4 right-4 no-print space-x-2 z-50">
            <Button onClick={onDone}><CheckCircle className="mr-2 h-4 w-4"/> {t('receipt.newSaleButton')}</Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> {t('receipt.printButton')}</Button>
      </div>
      <div ref={receiptRef} className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-lg printable-area">
         <Card className="shadow-none border-none">
            <CardHeader className="text-center p-4">
                <div className="flex justify-center mb-4">
                    {companyProfile?.logoUrl ? (
                        <img src={companyProfile.logoUrl} alt={companyProfile.name || 'Logo'} className="h-20 object-contain" />
                    ) : (
                        <Icons.logo className="h-12 w-12 text-primary" />
                    )}
                </div>
                <CardTitle>{companyProfile?.name || 'SafwanPOS'}</CardTitle>
                <CardDescription>{companyProfile?.invoiceTitle || t('receipt.title')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <div className="text-center text-xs text-muted-foreground mb-2 space-y-1">
                    {companyProfile?.address && <p>{companyProfile.address}</p>}
                    <div className="flex justify-center gap-4">
                        {companyProfile?.phone && <p>Tel: {companyProfile.phone}</p>}
                        {companyProfile?.email && <p>Email: {companyProfile.email}</p>}
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground my-2">
                    <span>{t('receipt.saleId')}: #{sale.id.substring(0,8)}</span>
                    <span>{t('receipt.date')}: {new Date(sale.saleDate).toLocaleString()}</span>
                </div>
                 <div className="text-xs text-muted-foreground mb-4">
                    <p>Sold by: {sale.user?.name || 'N/A'}</p>
                    {sale.customer && <p>Customer: {sale.customer.name}</p>}
                </div>
                <Separator />
                <div className="my-4 space-y-2">
                    {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-baseline text-sm">
                            <div>
                                <p>{item.product.name}</p>
                                <p className="text-muted-foreground text-xs">
                                    {item.quantity}{item.product.unit !== 'EACH' ? item.product.unit : ''} x {formatCurrency(item.price)}
                                </p>
                            </div>
                            <p>{formatCurrency(item.quantity * item.price)}</p>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="my-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>{t('pos.subtotal')}</span>
                        <span>{formatCurrency(sale.totalAmount)}</span>
                    </div>
                     <div className="flex justify-between text-destructive">
                        <span>{t('receipt.discount')}</span>
                        <span>-{formatCurrency(sale.discount)}</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>{t('pos.total')}</span>
                        <span>{formatCurrency(finalTotal)}</span>
                    </div>
                     <Separator className="my-2"/>
                     <div className="flex justify-between">
                        <span>{t('pos.amountPaid')}</span>
                        <span>{formatCurrency(sale.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base mt-2">
                        <span>{t('customers.balance')}</span>
                        <span>{formatCurrency(balance)}</span>
                    </div>
                </div>
                <Separator />
                <div className="text-center text-xs text-muted-foreground mt-6 space-y-1">
                    {companyProfile?.invoiceFooter && <p>{companyProfile.invoiceFooter}</p>}
                    <div className="flex justify-center gap-4">
                        {companyProfile?.taxId1Label && companyProfile.taxId1Value && <p>{companyProfile.taxId1Label}: {companyProfile.taxId1Value}</p>}
                        {companyProfile?.taxId2Label && companyProfile.taxId2Value && <p>{companyProfile.taxId2Label}: {companyProfile.taxId2Value}</p>}
                    </div>
                    <p className="pt-4">{t('receipt.thankYou')}</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
