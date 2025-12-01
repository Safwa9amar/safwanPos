
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

type ReceiptProps = {
  sale: Sale;
  onDone: () => void;
};

export function Receipt({ sale, onDone }: ReceiptProps) {
  const { t, i18n } = useTranslation("translation");
  const { formatCurrency } = useCurrency();
  const receiptRef = useRef(null);

  const companyProfile = sale.user?.companyProfile;
  const finalTotal = sale.totalAmount - sale.discount;
  const balance = finalTotal - sale.amountPaid;

  const handlePrint = () => {
    const doc = new jsPDF();
    const printT = (key: string) => i18n.getFixedT('en')(key);

    // --- Header ---
    if (companyProfile?.logoUrl) {
        // This is a simplified approach. For reliable image printing,
        // you might need to fetch the image and convert it to a data URI.
        // doc.addImage(companyProfile.logoUrl, 'PNG', 15, 10, 30, 30);
    }
    doc.setFontSize(18);
    doc.text(companyProfile?.name || 'SafwanPOS', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(companyProfile?.invoiceTitle || printT('receipt.title'), doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
    
    // --- Company Info ---
    let companyInfoY = 40;
    doc.setFontSize(9);
    if(companyProfile?.address) { doc.text(companyProfile.address, 15, companyInfoY); companyInfoY += 5; }
    if(companyProfile?.phone) { doc.text(`Phone: ${companyProfile.phone}`, 15, companyInfoY); }
    if(companyProfile?.email) { doc.text(`Email: ${companyProfile.email}`, 15, companyInfoY + 5); }
    if(companyProfile?.website) { doc.text(`Website: ${companyProfile.website}`, 15, companyInfoY + 10); companyInfoY += 5; }


    // --- Details ---
    let detailsY = companyInfoY + 15;
    doc.setFontSize(10);
    const saleIdText = `${printT('receipt.saleId')}: #${sale.id.substring(0,8)}`;
    const dateText = `${printT('receipt.date')}: ${new Date(sale.saleDate).toLocaleString()}`;
    doc.text(saleIdText, 15, detailsY);
    doc.text(dateText, 15, detailsY + 5);
    
    const soldBy = `${printT('users.name')}: ${sale.user?.name || 'N/A'}`;
    const customer = `${printT('history.customer')}: ${sale.customer?.name || printT('history.walkInCustomer')}`;
    doc.text(soldBy, 15, detailsY + 10);
    doc.text(customer, 15, detailsY + 15);


    // --- Items Table ---
    const tableData = sale.items.map(item => [
        item.product.name,
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);
    
    const head = [[printT('po.item'), printT('po.quantity'), printT('inventory.price'), printT('pos.total')]];
    
    autoTable(doc, {
        startY: detailsY + 25,
        head: head,
        body: tableData,
        theme: 'striped',
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);

    const addRightAlignedText = (text: string, y: number) => {
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(text, doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
    }
    const addLeftAlignedText = (text: string, y: number) => doc.text(text, 15, y);

    let currentY = finalY;

    const totals = [
        { label: printT('pos.subtotal'), value: formatCurrency(sale.totalAmount) },
        { label: printT('receipt.discount'), value: `-${formatCurrency(sale.discount)}` },
        { label: printT('pos.total'), value: formatCurrency(finalTotal), bold: true, size: 16 },
        { label: printT('pos.amountPaid'), value: formatCurrency(sale.amountPaid) },
        { label: printT('customers.balance'), value: formatCurrency(balance), bold: true },
    ];
    
    totals.forEach(item => {
        doc.setFontSize(item.size || 12);
        doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
        addLeftAlignedText(item.label, currentY);
        addRightAlignedText(item.value, currentY);
        currentY += (item.size || 12) / 2 + 4;
    });

    // --- Footer ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (companyProfile?.invoiceFooter) {
        doc.text(companyProfile.invoiceFooter, doc.internal.pageSize.getWidth() / 2, currentY + 10, { align: 'center', maxWidth: 180 });
        currentY += 15;
    }
    if (companyProfile?.taxId1Label && companyProfile.taxId1Value) {
        doc.text(`${companyProfile.taxId1Label}: ${companyProfile.taxId1Value}`, doc.internal.pageSize.getWidth() / 2, currentY + 5, { align: 'center' });
        currentY += 5;
    }
     if (companyProfile?.taxId2Label && companyProfile.taxId2Value) {
        doc.text(`${companyProfile.taxId2Label}: ${companyProfile.taxId2Value}`, doc.internal.pageSize.getWidth() / 2, currentY + 5, { align: 'center' });
        currentY += 5;
    }


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
                    {companyProfile?.logoUrl ? (
                        <img src={companyProfile.logoUrl} alt={companyProfile.name || 'Logo'} className="h-20" />
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
