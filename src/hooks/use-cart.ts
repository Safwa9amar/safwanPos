"use client";

import { useState, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/types';
import { useToast } from "@/hooks/use-toast";

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

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
            title: "Out of stock",
            description: `Cannot add more ${product.name}.`,
          });
          return prevItems;
        }
      }
      if (product.stock > 0) {
        return [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
      } else {
        toast({
            variant: "destructive",
            title: "Out of stock",
            description: `${product.name} is out of stock.`,
        });
        return prevItems;
      }
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
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
