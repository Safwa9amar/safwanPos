"use client";

import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/hooks/use-currency';

export function CartItem({ item, cart }: { item: CartItemType, cart: ReturnType<typeof useCart> }) {
  const { toast } = useToast();
  const { t } = useTranslation("translation");
  const { formatCurrency } = useCurrency();

  const handleQuantityChange = (newQuantityStr: string) => {
    const newQuantity = parseInt(newQuantityStr);

    if (isNaN(newQuantity) || newQuantity < 1) {
        cart.updateQuantity(item.productId, 1);
        return;
    }

    if(newQuantity > item.stock) {
        cart.updateQuantity(item.productId, item.stock);
        toast({
          variant: "destructive",
          title: t('cart.stockLimitReachedTitle'),
          description: t('cart.stockLimitReachedDescription', { stock: item.stock, itemName: item.name }),
        });
    } else {
        cart.updateQuantity(item.productId, newQuantity);
    }
  }

  const increment = () => {
    if (item.quantity < item.stock) {
        cart.updateQuantity(item.productId, item.quantity + 1);
    }
  }

  const decrement = () => {
    cart.updateQuantity(item.productId, item.quantity - 1);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-grow overflow-hidden">
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrement}>
          <Minus className="h-4 w-4" />
        </Button>
        <Input 
            type="text"
            className="h-8 w-12 text-center" 
            value={item.quantity} 
            onChange={(e) => handleQuantityChange(e.target.value)}
            onBlur={(e) => { if(e.target.value === '' || parseInt(e.target.value) < 1) handleQuantityChange('1')}}
        />
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={increment} disabled={item.quantity >= item.stock}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="w-24 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</p>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => cart.removeItem(item.productId)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
