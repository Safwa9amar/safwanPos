
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cairoFont } from '@/lib/cairo-font';
import type { UserOptions } from 'jspdf-autotable';

// Augment jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

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

  const handlePrint = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Add the Cairo font for Arabic support
    doc.addFileToVFS('Cairo-Regular-normal.ttf', cairoFont);
    doc.addFont('Cairo-Regular-normal.ttf', 'Cairo-Regular', 'normal');
    doc.setFont('Cairo-Regular');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageCenter = pageWidth / 2;
    
    let currentY = 15;

    // --- Header ---
    if (companyProfile?.logoUrl) {
      doc.addImage(companyProfile.logoUrl, 'PNG', pageCenter - 15, currentY, 30, 30);
      currentY += 35;
    }
    doc.setFontSize(16);
    doc.text(companyProfile?.name || "SafwanPOS", pageCenter, currentY, { align: 'center' });
    currentY += 8;
    
    doc.setFontSize(10);
    doc.text(companyProfile?.invoiceTitle || t('receipt.title'), pageCenter, currentY, { align: 'center' });
    currentY += 10;
    
    // --- Sale Info ---
    doc.setFontSize(8);
    doc.text(`${t('receipt.saleId')}: #${sale.id.substring(0,8)}`, 14, currentY);
    doc.text(`${t('receipt.date')}: ${new Date(sale.saleDate).toLocaleString()}`, pageWidth - 14, currentY, { align: 'right' });
    currentY += 5;
    doc.text(`Sold by: ${sale.user?.name || 'N/A'}`, 14, currentY);
    currentY += 5;
    if (sale.customer) {
      doc.text(`Customer: ${sale.customer.name}`, 14, currentY);
      currentY += 5;
    }
    currentY += 5;

    // --- Items Table ---
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = sale.items.map(item => [
        item.product.name,
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
        styles: { font: 'Cairo-Regular', fontStyle: 'normal' },
    });
    
    currentY = doc.autoTable.previous.finalY + 10;

    // --- Totals ---
    const addTotalLine = (label: string, value: string, isBold = false) => {
        doc.setFontSize(isBold ? 12 : 10);
        doc.setFont('Cairo-Regular', isBold ? 'bold' : 'normal');
        doc.text(label, 14, currentY);
        doc.text(value, pageWidth - 14, currentY, { align: 'right' });
        currentY += (isBold ? 8 : 6);
    };

    addTotalLine(t('pos.subtotal'), formatCurrency(sale.totalAmount));
    if (sale.discount > 0) {
      addTotalLine(t('receipt.discount'), `-${formatCurrency(sale.discount)}`);
    }
    addTotalLine(t('pos.total'), formatCurrency(finalTotal), true);
    addTotalLine(t('pos.amountPaid'), formatCurrency(sale.amountPaid));
    addTotalLine(t('customers.balance'), formatCurrency(balance), true);

    currentY += 5;

    // --- Footer ---
    doc.setFontSize(8);
    doc.text(companyProfile?.invoiceFooter || t('receipt.thankYou'), pageCenter, currentY, { align: 'center' });

    doc.save(`Receipt-Sale-${sale.id.substring(0,8)}.pdf`);
    onDone();
  };

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
                        {companyProfile?.taxId2Label && companyProfile.taxId2Value && <p>{companyFile.taxId2Label}: {companyFile.taxId2Value}</p>}
                    </div>
                    <p className="pt-4">{t('receipt.thankYou')}</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
