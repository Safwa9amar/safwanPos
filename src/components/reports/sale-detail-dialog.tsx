"use client";

import * as React from "react";
import { useRef } from 'react';
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
import { Icons } from '../icons';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PrintableReceipt = React.forwardRef<HTMLDivElement, { sale: SaleWithItemsAndCustomer }>(({ sale }, ref) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    return (
        <div ref={ref} className="p-6 bg-white text-black">
            <div className="text-center mb-4">
                <Icons.logo className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-xl font-bold">PrismaPOS</h2>
                <p className="text-sm text-gray-500">{t('receipt.title')}</p>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{t('receipt.saleId')}: #{sale.id.substring(0,8)}</span>
                <span>{t('receipt.date')}: {new Date(sale.saleDate).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 mb-4">
                {sale.customer && <p>Customer: {sale.customer.name}</p>}
            </div>
            <Separator />
            <div className="my-4 space-y-2">
                {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-baseline text-sm">
                        <div>
                            <p>{item.product.name}</p>
                            <p className="text-gray-500 text-xs">
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
            <p className="text-center text-xs text-gray-500 mt-6">
                {t('receipt.thankYou')}
            </p>
        </div>
    );
});
PrintableReceipt.displayName = 'PrintableReceipt';

export function SaleDetailDialog({ isOpen, onOpenChange, sale }: SaleDetailDialogProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const input = printRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a6'); 
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
      });
    }
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
        <div className="hidden">
            <div style={{ position: 'absolute', left: '-9999px' }}>
              {sale && <PrintableReceipt sale={sale} ref={printRef} />}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
