
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrderWithItems } from './purchase-order-list';
import { receivePurchaseOrderItems } from '@/app/suppliers/actions';

interface ReceiveStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrderWithItems | null;
}

type ReceivedItem = {
  purchaseOrderItemId: string;
  ordered: number;
  alreadyReceived: number;
  receivedNow: number | string;
};

export function ReceiveStockDialog({ isOpen, onOpenChange, purchaseOrder }: ReceiveStockDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useState(() => {
    if (purchaseOrder) {
      setReceivedItems(purchaseOrder.items.map(item => ({
        purchaseOrderItemId: item.id,
        ordered: item.quantity,
        alreadyReceived: item.receivedQuantity,
        receivedNow: '',
      })));
    }
  }, [purchaseOrder]);
  
  const handleReceiveChange = (itemId: string, value: string) => {
    setReceivedItems(prev => prev.map(item => 
        item.purchaseOrderItemId === itemId ? { ...item, receivedNow: value } : item
    ));
  };
  
  const handleSave = async () => {
    if (!user || !purchaseOrder) return;

    setIsLoading(true);

    const itemsToReceive = receivedItems
        .map(item => ({ ...item, receivedNow: Number(item.receivedNow) }))
        .filter(item => !isNaN(item.receivedNow) && item.receivedNow > 0);

    const result = await receivePurchaseOrderItems(user.id, purchaseOrder.id, itemsToReceive);

    setIsLoading(false);

    if (result.success) {
        toast({ title: 'Stock Received', description: 'Inventory levels have been updated.' });
        onOpenChange(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  if (!purchaseOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receive Stock for PO #{purchaseOrder.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            Enter the quantity of items received in this delivery. Stock levels will be updated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Ordered</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="w-32 text-center">Receiving Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map(item => {
                  const receivedItem = receivedItems.find(ri => ri.purchaseOrderItemId === item.id);
                  return (
                    <TableRow key={item.id}>
                        <TableCell>{item.id.substring(0,8)}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">{item.receivedQuantity}</TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                value={receivedItem?.receivedNow || ''}
                                onChange={e => handleReceiveChange(item.id, e.target.value)}
                                max={item.quantity - item.receivedQuantity}
                                min={0}
                            />
                        </TableCell>
                    </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('pos.cancelButton')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
