
"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
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

const getInitialState = () => {
    if (typeof window === 'undefined') {
        return { carts: [createEmptyCart()], activeCartIndex: 0 };
    }
    try {
        const storedState = localStorage.getItem('multiCartState');
        if (storedState) {
            const parsedState = JSON.parse(storedState);
            // Basic validation to ensure we don't crash on malformed data
            if (Array.isArray(parsedState.carts) && typeof parsedState.activeCartIndex === 'number') {
                if (parsedState.carts.length === 0) {
                     return { carts: [createEmptyCart()], activeCartIndex: 0 };
                }
                return parsedState;
            }
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
    }
    return { carts: [createEmptyCart()], activeCartIndex: 0 };
};


export const useMultiCart = () => {
  const [state, setState] = useState(getInitialState);
  const { toast } = useToast();
  const { t } = useTranslation("translation");

  const { carts, activeCartIndex } = state;

  useEffect(() => {
    try {
        localStorage.setItem('multiCartState', JSON.stringify(state));
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  }, [state]);

  const updateCart = (index: number, newItems: CartItem[]) => {
    setState(prevState => {
        const newCarts = [...prevState.carts];
        const newTotals = calculateCartTotals(newItems);
        newCarts[index] = { ...newCarts[index], items: newItems, ...newTotals };
        return { ...prevState, carts: newCarts };
    })
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
    // When a sale is completed, we replace the active cart with an empty one.
    setState(prevState => {
        const newCarts = [...prevState.carts];
        newCarts[prevState.activeCartIndex] = createEmptyCart();
        return { ...prevState, carts: newCarts };
    })
  }, []);
  
  const addCart = useCallback(() => {
    if (carts.length < 9) {
      setState(prev => {
        const newCarts = [...prev.carts, createEmptyCart()];
        return { ...prev, carts: newCarts, activeCartIndex: newCarts.length - 1 };
      });
    }
  }, [carts.length]);

  const removeCart = useCallback((indexToRemove: number) => {
    if (carts.length <= 1) return;

    setState(prev => {
        const newCarts = prev.carts.filter((_, index) => index !== indexToRemove);
        const newActiveIndex = prev.activeCartIndex >= indexToRemove ? Math.max(0, prev.activeCartIndex - 1) : prev.activeCartIndex;
        return { carts: newCarts, activeCartIndex: newActiveIndex };
    });
  }, [carts.length, activeCartIndex]);

  const switchCart = useCallback((index: number) => {
    if (index >= 0 && index < carts.length) {
      setState(prev => ({ ...prev, activeCartIndex: index }));
    }
  }, [carts.length]);
  
  const switchToOrAddCart = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < 9) {
      setState(prev => {
        if (targetIndex < prev.carts.length) {
          return { ...prev, activeCartIndex: targetIndex };
        } else {
          const newCartsToAdd = targetIndex - prev.carts.length + 1;
          const newEmptyCarts = Array(newCartsToAdd).fill(null).map(() => createEmptyCart());
          return { ...prev, carts: [...prev.carts, ...newEmptyCarts], activeCartIndex: targetIndex };
        }
      });
    }
  }, []);

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
    switchToOrAddCart,
  };
};
