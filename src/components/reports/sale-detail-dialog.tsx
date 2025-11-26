
"use client";

import * as React from "react";
import { SaleWithItemsAndCustomer } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useCurrency } from "@/hooks/use-currency";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "../ui/table";
import { Badge } from "../ui/badge";
import { Printer } from "lucide-react";
import jsPDF from "jspdf";

interface SaleDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sale: SaleWithItemsAndCustomer | null;
}


export function SaleDetailDialog({ isOpen, onOpenChange, sale }: SaleDetailDialogProps) {
  const { t } = useTranslation();
  const { formatCurrency, currency } = useCurrency();

  const handlePrint = () => {
    if (!sale) return;

    const doc = new jsPDF();
    let y = 15;

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PrismaPOS", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(t('receipt.title'), doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 10;

    // --- Info ---
    doc.setFontSize(8);
    doc.text(`${t('receipt.saleId')}: #${sale.id.substring(0,8)}`, 14, y);
    doc.text(`${t('receipt.date')}: ${new Date(sale.saleDate).toLocaleString()}`, doc.internal.pageSize.getWidth() - 14, y, { align: 'right' });
    y += 5;
    
    if (sale.customer?.name) {
        doc.text(`${t('history.customer')}: ${sale.customer.name}`, 14, y);
        y+= 5;
    }
    
    doc.setLineWidth(0.2);
    doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
    y += 8;

    // --- Items Table ---
    doc.setFont("helvetica", "bold");
    doc.text(t('po.item'), 14, y);
    doc.text(t('po.quantity'), 120, y, { align: 'center' });
    doc.text(t('inventory.price'), 150, y, { align: 'center' });
    doc.text(t('po.total'), doc.internal.pageSize.getWidth() - 14, y, { align: 'right' });
    y += 6;
    
    doc.setFont("helvetica", "normal");
    sale.items.forEach(item => {
        const itemText = `${item.product.name}`;
        const priceText = `${item.quantity}${item.product.unit !== 'EACH' ? item.product.unit : ''} x ${formatCurrency(item.price)}`;
        
        doc.setFontSize(9);
        doc.text(itemText, 14, y);
        doc.text((item.quantity).toString(), 120, y, { align: 'center' });
        doc.text(formatCurrency(item.price), 150, y, { align: 'center' });
        doc.text(formatCurrency(item.price * item.quantity), doc.internal.pageSize.getWidth() - 14, y, { align: 'right' });
        
        y += 4;
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(priceText, 14, y);
        doc.setTextColor(0);
        y += 5;
    });

    // --- Totals ---
    y += 5;
    doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t('pos.total'), 14, y);
    doc.text(formatCurrency(sale.totalAmount), doc.internal.pageSize.getWidth() - 14, y, { align: 'right' });
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(t('pos.amountPaid'), 14, y);
    doc.text(formatCurrency(sale.amountPaid), doc.internal.pageSize.getWidth() - 14, y, { align: 'right' });
    y += 7;

    doc.text(t('customers.balance'), 14, y);
    doc.text(formatCurrency(sale.totalAmount - sale.amountPaid), doc.internal.pageSize.getWidth() - 14, y, { align: 'right' });


    // --- Footer ---
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(t('receipt.thankYou'), doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });

    // --- Print ---
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };


  if (!sale) return null;
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CREDIT': return 'destructive';
      case 'CARD': return 'secondary';
      case 'CASH':
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('history.saleDetailTitle')} #{sale.id.substring(0,8)}</DialogTitle>
          <DialogDescription>
            {format(new Date(sale.saleDate), "PPPP p")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
             <div className="flex items-center gap-4 text-sm">
                <div><span className="font-semibold">{t('history.customer')}:</span> {sale.customer?.name || t('history.walkInCustomer')}</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t('history.paymentType')}:</span> <Badge variant={getStatusVariant(sale.paymentType)}>{sale.paymentType}</Badge>
                </div>
            </div>
            <Separator />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('po.item')}</TableHead>
                        <TableHead className="text-center">{t('po.quantity')}</TableHead>
                        <TableHead className="text-right">{t('inventory.price')}</TableHead>
                        <TableHead className="text-right">{t('po.total')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sale.items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell className="text-center">{item.quantity} {item.product.unit !== 'EACH' && `(${item.product.unit})`}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold text-lg">{t('pos.total')}</TableCell>
                        <TableCell className="text-right font-bold text-lg">{formatCurrency(sale.totalAmount)}</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">{t('pos.amountPaid')}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(sale.amountPaid)}</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">{t('customers.balance')}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(sale.totalAmount - sale.amountPaid)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('history.close')}
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t('receipt.printButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
