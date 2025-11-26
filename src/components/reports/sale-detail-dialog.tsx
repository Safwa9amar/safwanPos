
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
import { cairoFont } from "@/lib/cairo-font";

interface SaleDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sale: SaleWithItemsAndCustomer | null;
}


export function SaleDetailDialog({ isOpen, onOpenChange, sale }: SaleDetailDialogProps) {
  const { t, language, dir } = useTranslation();
  const { formatCurrency, currency } = useCurrency();

  const handlePrint = () => {
    if (!sale) return;

    const doc = new jsPDF();
    const isArabic = language === 'ar';
    
    // Add the Cairo font if Arabic
    if (isArabic) {
        doc.addFileToVFS("Cairo-Regular-normal.ttf", cairoFont);
        doc.addFont("Cairo-Regular-normal.ttf", "Cairo-Regular", "normal");
        doc.setFont("Cairo-Regular");
    }

    let y = 15;
    const page_width = doc.internal.pageSize.getWidth();
    const left_margin = 14;
    const right_margin = page_width - 14;

    const rtl_x = (text: string) => isArabic ? right_margin : left_margin;
    const rtl_align = isArabic ? 'right' : 'left';
    
    const rtl_x_center = (text: string) => isArabic ? left_margin : right_margin;
    const rtl_align_center = isArabic ? 'left' : 'right';

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PrismaPOS", page_width / 2, y, { align: "center" });
    y += 8;
    
    doc.setFontSize(10);
    if (!isArabic) doc.setFont("helvetica", "normal");
    doc.text(t('receipt.title'), page_width / 2, y, { align: "center" });
    y += 10;

    // --- Info ---
    doc.setFontSize(8);
    const saleIdText = `${t('receipt.saleId')}: #${sale.id.substring(0,8)}`;
    const dateText = `${t('receipt.date')}: ${new Date(sale.saleDate).toLocaleString(language)}`;
    
    doc.text(saleIdText, rtl_x(saleIdText), y, { align: rtl_align });
    doc.text(dateText, rtl_x_center(dateText), y, { align: rtl_align_center });
    y += 5;
    
    if (sale.customer?.name) {
        const customerText = `${t('history.customer')}: ${sale.customer.name}`;
        doc.text(customerText, rtl_x(customerText), y, { align: rtl_align });
        y+= 5;
    }
    
    doc.setLineWidth(0.2);
    doc.line(14, y, page_width - 14, y);
    y += 8;

    // --- Items Table ---
    if (!isArabic) doc.setFont("helvetica", "bold"); else doc.setFont("Cairo-Regular", "normal");
    const itemHeaderText = t('po.item');
    const qtyHeaderText = t('po.quantity');
    const priceHeaderText = t('inventory.price');
    const totalHeaderText = t('po.total');

    doc.text(itemHeaderText, rtl_x(itemHeaderText), y, { align: rtl_align });
    doc.text(qtyHeaderText, page_width / 2 - 10, y, { align: 'center' });
    doc.text(priceHeaderText, page_width / 2 + 30, y, { align: 'center' });
    doc.text(totalHeaderText, rtl_x_center(totalHeaderText), y, { align: rtl_align_center });
    y += 6;
    
    if (!isArabic) doc.setFont("helvetica", "normal");

    sale.items.forEach(item => {
        let name = item.product.name;
        // jspdf doesn't handle mixed latin/arabic scripts well, so we reverse for display
        if (isArabic) {
            const arabicReverse = (s:string) => s.split('').reverse().join('');
            const latinChars = name.match(/[a-zA-Z0-9\s.,()-]+/g);
            if (latinChars) {
                latinChars.forEach(part => {
                    name = name.replace(part, arabicReverse(part));
                });
            }
        }
        const itemText = name;
        const priceText = `${item.quantity}${item.product.unit !== 'EACH' ? item.product.unit : ''} x ${formatCurrency(item.price)}`;
        
        doc.setFontSize(9);
        doc.text(itemText, rtl_x(itemText), y, { align: rtl_align });
        doc.text((item.quantity).toString(), page_width / 2 - 10, y, { align: 'center' });
        doc.text(formatCurrency(item.price), page_width / 2 + 30, y, { align: 'center' });
        doc.text(formatCurrency(item.price * item.quantity), rtl_x_center(formatCurrency(item.price * item.quantity)), y, { align: rtl_align_center });
        
        y += 4;
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(priceText, rtl_x(priceText), y, { align: rtl_align });
        doc.setTextColor(0);
        y += 5;
    });

    // --- Totals ---
    y += 5;
    doc.line(14, y, page_width - 14, y);
    y += 8;

    doc.setFontSize(12);
    if (!isArabic) doc.setFont("helvetica", "bold"); else doc.setFont("Cairo-Regular", "normal");
    const totalText = t('pos.total');
    doc.text(totalText, rtl_x(totalText), y, { align: rtl_align });
    doc.text(formatCurrency(sale.totalAmount), rtl_x_center(formatCurrency(sale.totalAmount)), y, { align: rtl_align_center });
    y += 7;

    doc.setFontSize(10);
    if (!isArabic) doc.setFont("helvetica", "normal");
    const amountPaidText = t('pos.amountPaid');
    doc.text(amountPaidText, rtl_x(amountPaidText), y, { align: rtl_align });
    doc.text(formatCurrency(sale.amountPaid), rtl_x_center(formatCurrency(sale.amountPaid)), y, { align: rtl_align_center });
    y += 7;

    const balanceText = t('customers.balance');
    doc.text(balanceText, rtl_x(balanceText), y, { align: rtl_align });
    doc.text(formatCurrency(sale.totalAmount - sale.amountPaid), rtl_x_center(formatCurrency(sale.totalAmount - sale.amountPaid)), y, { align: rtl_align_center });


    // --- Footer ---
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(t('receipt.thankYou'), page_width / 2, y, { align: 'center' });

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
