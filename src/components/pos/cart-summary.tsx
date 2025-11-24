
"use client";

import { useMultiCart } from '@/hooks/use-multi-cart';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItem as CartItemType } from '@/types';
import { CartItem } from './cart-item';
import { PackageOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useCurrency } from '@/hooks/use-currency';

export function CartSummary({ cart }: { cart: ReturnType<typeof useMultiCart> }) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const activeCart = cart.activeCart;
  
  return (
    <>
      <CardContent className="flex-grow p-0 relative">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          {activeCart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
              <PackageOpen className="h-16 w-16 mb-4" />
              <p className="font-semibold">{t('pos.cartEmpty')}</p>
              <p className="text-sm">{t('pos.scanToBegin')}</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4 p-6">
                {activeCart.items.map((item: CartItemType) => (
                  <CartItem key={item.productId} item={item} cart={cart} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      {activeCart.items.length > 0 && (
        <CardFooter className="flex-col items-start gap-4 p-6 border-t bg-slate-50/50 dark:bg-card">
            <div className="flex justify-between w-full text-muted-foreground">
              <span>{t('pos.subtotal')}</span>
              <span>{formatCurrency(activeCart.subtotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between w-full font-bold text-lg">
              <span>{t('pos.total')}</span>
              <span>{formatCurrency(activeCart.totalAmount)}</span>
            </div>
        </CardFooter>
      )}
    </>
  );
}
