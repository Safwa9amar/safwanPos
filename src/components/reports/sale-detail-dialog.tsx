
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
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";

interface SaleDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sale: SaleWithItemsAndCustomer | null;
}

export function SaleDetailDialog({ isOpen, onOpenChange, sale }: SaleDetailDialogProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
      content: () => printRef.current,
      documentTitle: `Sale-${sale?.id.substring(0,8)}`,
  });

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
        <div ref={printRef} className="printable-area">
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
        </div>
        <DialogFooter className="no-print">
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
