
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cairoFont } from '@/lib/cairo-font';

interface SaleDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sale: SaleWithItemsAndCustomer | null;
}

export function SaleDetailDialog({ isOpen, onOpenChange, sale }: SaleDetailDialogProps) {
  const { t, language } = useTranslation();
  const { formatCurrency } = useCurrency();

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

  const handlePrint = () => {
      const doc = new jsPDF();

      // Add Cairo font for Arabic support
      doc.addFileToVFS("Cairo-Regular-normal.ttf", cairoFont);
      doc.addFont("Cairo-Regular-normal.ttf", "Cairo-Regular", "normal");

      const isArabic = language === 'ar';
      
      if (isArabic) {
        doc.setFont("Cairo-Regular");
        doc.setR2L(true);
      } else {
        doc.setFont("helvetica");
        doc.setR2L(false);
      }
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const center = pageWidth / 2;

      // Header
      doc.setFontSize(22);
      doc.text("PrismaPOS", center, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(t('receipt.title'), center, 28, { align: 'center' });

      // Sale Info
      doc.setFontSize(9);
      doc.text(`${t('receipt.saleId')}: #${sale.id.substring(0,8)}`, isArabic ? pageWidth - 14 : 14, 40);
      doc.text(new Date(sale.saleDate).toLocaleString(), isArabic ? 14 : pageWidth - 14, 40, { align: isArabic ? 'left' : 'right'});
      
      doc.text(`${t('history.customer')}: ${sale.customer?.name || t('history.walkInCustomer')}`, isArabic ? pageWidth - 14 : 14, 45);
      
      // Table
      const tableColumn = [t('po.item'), t('po.quantity'), t('inventory.price'), t('po.total')];
      const tableRows: (string | number)[][] = [];

      sale.items.forEach(item => {
          const itemData = [
              isArabic ? item.product.name.split('').reverse().join('') : item.product.name, // Basic reversal for item name if Arabic
              item.quantity,
              formatCurrency(item.price),
              formatCurrency(item.price * item.quantity)
          ];
          tableRows.push(itemData);
      });
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: isArabic ? 'right' : 'left'
        },
        bodyStyles: {
            halign: isArabic ? 'right' : 'left'
        },
        didParseCell: function(data) {
            if (isArabic) {
                // For quantity, price, total columns, align left
                if (data.column.index > 0) {
                    data.cell.styles.halign = 'left';
                }
            }
        },
        foot: [
            [{ content: t('pos.total'), colSpan: 3, styles: { halign: isArabic ? 'left' : 'right', fontStyle: 'bold', fontSize: 14 } }, { content: formatCurrency(sale.totalAmount), styles: { halign: isArabic ? 'left' : 'right', fontStyle: 'bold', fontSize: 14 } }],
            [{ content: t('pos.amountPaid'), colSpan: 3, styles: { halign: isArabic ? 'left' : 'right' } }, { content: formatCurrency(sale.amountPaid), styles: { halign: isArabic ? 'left' : 'right' } }],
            [{ content: t('customers.balance'), colSpan: 3, styles: { halign: isArabic ? 'left' : 'right', fontStyle: 'bold' } }, { content: formatCurrency(sale.totalAmount - sale.amountPaid), styles: { halign: isArabic ? 'left' : 'right', fontStyle: 'bold' } }],
        ],
        footStyles: {
             fillColor: [236, 240, 241]
        }
      });
      
      let finalY = (doc as any).lastAutoTable.finalY;
      
      // Footer
      doc.setFontSize(10);
      doc.text(t('receipt.thankYou'), center, finalY + 15, { align: 'center' });

      // Open print dialog
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
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
