"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { CreditCard, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function CompleteSaleDialog({ onConfirm, cart, isCompleting }: { onConfirm: () => void, cart: ReturnType<typeof useCart>, isCompleting: boolean }) {
  const { t } = useTranslation();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" size="lg" disabled={cart.items.length === 0 || isCompleting}>
          <CreditCard className="mr-2 h-5 w-5" />
          {isCompleting ? t('pos.processing') : t('pos.completeSaleButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('pos.confirmSaleTitle')}</DialogTitle>
          <DialogDescription>
            {t('pos.confirmSaleDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 my-4">
            <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">{t('pos.totalItems')}</span>
                <span className="font-bold">{cart.totalItems}</span>
            </div>
            <div className="flex justify-between items-center text-3xl">
                <span className="text-muted-foreground">{t('pos.total')}</span>
                <span className="font-bold text-primary">${cart.totalAmount.toFixed(2)}</span>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isCompleting}>{t('pos.cancelButton')}</Button>
          </DialogClose>
          <Button onClick={onConfirm} disabled={isCompleting}>
            {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('pos.confirmAndPrintButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
