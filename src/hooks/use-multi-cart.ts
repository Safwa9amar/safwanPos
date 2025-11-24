
"use client";

import { useState, useCallback, useMemo } from 'react';
import { CartItem } from '@/types';
import { Product } from '@prisma/client';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

type Cart = {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  totalAmount: number;
};

const createEmptyCart = (): Cart => ({
  items: [],
  subtotal: 0,
  totalItems: 0,
  totalAmount: 0,
});

const calculateCartTotals = (items: CartItem[]): Partial<Cart> => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalItems, totalAmount: subtotal };
};

export const useMultiCart = () => {
  const [carts, setCarts] = useState<Cart[]>([createEmptyCart()]);
  const [activeCartIndex, setActiveCartIndex] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation("translation");

  const updateCart = (index: number, newItems: CartItem[]) => {
    setCarts(prevCarts => {
      const newCarts = [...prevCarts];
      const newTotals = calculateCartTotals(newItems);
      newCarts[index] = { ...newCarts[index], items: newItems, ...newTotals };
      return newCarts;
    });
  };

  const addItem = useCallback((product: Product) => {
    const activeCartItems = carts[activeCartIndex].items;
    const existingItem = activeCartItems.find((item) => item.productId === product.id);

    let newItems: CartItem[];
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        newItems = activeCartItems.map((item) =>
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
        return;
      }
    } else {
      if (product.stock > 0) {
        newItems = [...activeCartItems, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
      } else {
        toast({
          variant: "destructive",
          title: t('cart.outOfStockTitle'),
          description: t('cart.isOutOfStock', { productName: product.name }),
        });
        return;
      }
    }
    updateCart(activeCartIndex, newItems);
  }, [carts, activeCartIndex, toast, t]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const activeCartItems = carts[activeCartIndex].items;
    let newItems;
    if (quantity <= 0) {
      newItems = activeCartItems.filter((item) => item.productId !== productId);
    } else {
      newItems = activeCartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    }
    updateCart(activeCartIndex, newItems);
  }, [carts, activeCartIndex]);

  const removeItem = useCallback((productId: string) => {
    const activeCartItems = carts[activeCartIndex].items;
    const newItems = activeCartItems.filter((item) => item.productId !== productId);
    updateCart(activeCartIndex, newItems);
  }, [carts, activeCartIndex]);

  const clearCart = useCallback(() => {
    updateCart(activeCartIndex, []);
  }, [activeCartIndex]);
  
  const addCart = useCallback(() => {
    if (carts.length < 9) {
      setCarts(prev => [...prev, createEmptyCart()]);
      setActiveCartIndex(carts.length);
    }
  }, [carts.length]);

  const removeCart = useCallback((indexToRemove: number) => {
    if (carts.length <= 1) return;

    setCarts(prev => prev.filter((_, index) => index !== indexToRemove));

    if (activeCartIndex >= indexToRemove) {
      setActiveCartIndex(prev => Math.max(0, prev - 1));
    }
  }, [carts.length, activeCartIndex]);

  const switchCart = useCallback((index: number) => {
    if (index >= 0 && index < carts.length) {
      setActiveCartIndex(index);
    }
  }, [carts.length]);

  const activeCart = useMemo(() => {
    return carts[activeCartIndex] || createEmptyCart();
  }, [carts, activeCartIndex]);

  return {
    carts,
    activeCartIndex,
    activeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    addCart,
    removeCart,
    switchCart,
  };
};
