
// This file is no longer used and has been replaced by use-multi-cart.ts
// It can be safely deleted, but we will leave it for now to avoid breaking imports in other parts of the app that have not been updated yet.

"use client";

import { useState, useCallback, useMemo } from 'react';
import { CartItem } from '@/types';
import { Product } from '@prisma/client';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation("translation");

  const addItem = useCallback((product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        if(existingItem.quantity < product.stock) {
          return prevItems.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast({
            variant: "destructive",
            title: t('cart.outOfStockTitle'),
            description: t('cart.cannotAddMore', { productName: product.name }),
          });
          return prevItems;
        }
      }
      if (product.stock > 0) {
        return [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
      } else {
        toast({
            variant: "destructive",
            title: t('cart.outOfStockTitle'),
            description: t('cart.isOutOfStock', { productName: product.name }),
        });
        return prevItems;
      }
    });
  }, [toast, t]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const { subtotal, totalItems } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, totalItems };
  }, [items]);
  

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalAmount: subtotal, // Assuming no tax/discounts for now
    totalItems,
  };
};
