
"use client";

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
import { ScrollArea } from "../ui/scroll-area";
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
    const customer = `${t('history.customer')}: ${sale.customer?.name || t('history.walkInCustomer')}`;
    
    if (isArabic) {
        doc.text(saleIdText, doc.internal.pageSize.getWidth() - 15, 40, { align: 'right' });
        doc.text(dateText, doc.internal.pageSize.getWidth() - 15, 45, { align: 'right' });
        doc.text(customer, doc.internal.pageSize.getWidth() - 15, 50, { align: 'right' });
    } else {
        doc.text(saleIdText, 15, 40);
        doc.text(dateText, 15, 45);
        doc.text(customer, 15, 50);
    }

    // --- Items Table ---
    const tableData = sale.items.map(item => [
        isArabic ? item.product.name.split('').reverse().join('') : item.product.name,
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);
    const head = [[t('po.item'), t('po.quantity'), t('inventory.price'), t('pos.total')]];
    
    autoTable(doc, {
        startY: 60,
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
                data.table.body.forEach(row => {
                    row.cells[1].styles.halign = 'left';
                    row.cells[2].styles.halign = 'left';
                    row.cells[3].styles.halign = 'left';
                });
            }
        }
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);

    const addRightAlignedText = (text: string, y: number) => doc.text(text, doc.internal.pageSize.getWidth() - 15, y, { align: 'right' });
    const addLeftAlignedText = (text: string, y: number) => doc.text(text, 15, y);

    const totals = [
        { label: t('pos.total'), value: formatCurrency(sale.totalAmount), bold: true, size: 16 },
        { label: t('pos.amountPaid'), value: formatCurrency(sale.amountPaid) },
        { label: t('customers.balance'), value: formatCurrency(sale.totalAmount - sale.amountPaid), bold: true },
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

    // --- Print ---
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }
  
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
             <ScrollArea className="h-[400px]">
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
                </Table>
            </ScrollArea>
             <Separator />
             <Table>
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
