
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
import autoTable from 'jspdf-autotable';
import { cairoFont } from '@/lib/cairo-font';

type ReceiptProps = {
  sale: Sale;
  onDone: () => void;
};

export function Receipt({ sale, onDone }: ReceiptProps) {
  const { t, language } = useTranslation("translation");
  const { formatCurrency } = useCurrency();
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const doc = new jsPDF();
    const isArabic = language === 'ar';

    // Add Cairo font for Arabic support
    doc.addFileToVFS('Cairo-Regular-normal.ttf', cairoFont);
    doc.addFont('Cairo-Regular-normal.ttf', 'Cairo', 'normal');

    if (isArabic) {
        doc.setFont('Cairo');
        doc.setR2L(true);
    }

    // --- Header ---
    doc.setFontSize(22);
    doc.text("SafwanPOS", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(t('receipt.title'), doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // --- Details ---
    doc.setFontSize(10);
    const saleIdText = `${t('receipt.saleId')}: #${sale.id.substring(0,8)}`;
    const dateText = `${t('receipt.date')}: ${new Date(sale.saleDate).toLocaleString()}`;
    if (isArabic) {
        doc.text(saleIdText, doc.internal.pageSize.getWidth() - 15, 40, { align: 'right' });
        doc.text(dateText, doc.internal.pageSize.getWidth() - 15, 45, { align: 'right' });
    } else {
        doc.text(saleIdText, 15, 40);
        doc.text(dateText, 15, 45);
    }
    
    const soldBy = `${t('users.name')}: ${sale.user?.name || 'N/A'}`;
    const customer = `${t('history.customer')}: ${sale.customer?.name || t('history.walkInCustomer')}`;
    if(isArabic) {
      doc.text(soldBy, doc.internal.pageSize.getWidth() - 15, 50, { align: 'right' });
      doc.text(customer, doc.internal.pageSize.getWidth() - 15, 55, { align: 'right' });
    } else {
      doc.text(soldBy, 15, 50);
      doc.text(customer, 15, 55);
    }


    // --- Items Table ---
    const tableData = sale.items.map(item => [
        isArabic ? (item.product.name.split('').reverse().join('')) : item.product.name, // Simple reverse for RTL, consider a bidi library for complex cases
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.quantity * item.price)
    ]);
    
    const head = [[t('po.item'), t('po.quantity'), t('inventory.price'), t('pos.total')]];
    
    autoTable(doc, {
        startY: 65,
        head: head,
        body: tableData,
        theme: 'striped',
        headStyles: {
            font: isArabic ? 'Cairo' : 'helvetica',
            halign: isArabic ? 'right' : 'left'
        },
        bodyStyles: {
            font: isArabic ? 'Cairo' : 'helvetica',
            halign: isArabic ? 'right' : 'left'
        },
        didDrawPage: (data) => {
            if (isArabic) {
                // Manually align numbers to the left for Arabic layout
                 data.table.body.forEach(row => {
                    row.cells[1].styles.halign = 'left'; // Quantity
                    row.cells[2].styles.halign = 'left'; // Price
                    row.cells[3].styles.halign = 'left'; // Total
                });
            }
        }
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);

    const addRightAlignedText = (text: string, y: number) => {
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(text, doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
    }
    const addLeftAlignedText = (text: string, y: number) => doc.text(text, 15, y);

    const totals = [
        { label: t('pos.subtotal'), value: formatCurrency(sale.totalAmount) },
        { label: t('pos.amountPaid'), value: formatCurrency(sale.amountPaid) },
        { label: t('customers.balance'), value: formatCurrency(sale.totalAmount - sale.amountPaid), bold: true },
        { label: t('pos.total'), value: formatCurrency(sale.totalAmount), bold: true, size: 16 }
    ];
    
    let currentY = finalY;
    totals.forEach(item => {
        doc.setFontSize(item.size || 12);
        doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
        if (isArabic) {
            doc.setFont('Cairo', item.bold ? 'bold' : 'normal');
            addRightAlignedText(item.label, currentY);
            addLeftAlignedText(item.value, currentY);
        } else {
            addLeftAlignedText(item.label, currentY);
            addRightAlignedText(item.value, currentY);
        }
        currentY += (item.size || 12) / 2 + 4;
    });

    // --- Footer ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(t('receipt.thankYou'), doc.internal.pageSize.getWidth() / 2, currentY + 10, { align: 'center' });

    // --- Print ---
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    onDone();
  };

  return (
    <div className="flex items-center justify-center p-4 bg-muted/40 min-h-screen">
      <div className="fixed top-4 right-4 no-print space-x-2 z-50">
            <Button onClick={onDone}><CheckCircle className="mr-2 h-4 w-4"/> {t('receipt.newSaleButton')}</Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> {t('receipt.printButton')}</Button>
      </div>
      <div ref={receiptRef} className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-lg">
         <Card className="shadow-none border-none">
            <CardHeader className="text-center p-4">
                <div className="flex justify-center mb-4">
                    <Icons.logo className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>SafwanPOS</CardTitle>
                <CardDescription>{t('receipt.title')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
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
                     <div className="flex justify-between">
                        <span>{t('pos.amountPaid')}</span>
                        <span>{formatCurrency(sale.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base mt-2">
                        <span>{t('customers.balance')}</span>
                        <span>{formatCurrency(sale.totalAmount - sale.amountPaid)}</span>
                    </div>
                </div>
                 <div className="my-4 space-y-1 text-sm">
                    <div className="flex justify-between font-bold text-lg">
                        <span>{t('pos.total')}</span>
                        <span>{formatCurrency(sale.totalAmount)}</span>
                    </div>
                </div>
                <Separator />
                <p className="text-center text-xs text-muted-foreground mt-6">
                    {t('receipt.thankYou')}
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
