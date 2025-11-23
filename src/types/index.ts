import { Sale as PrismaSale, SaleItem as PrismaSaleItem } from '@prisma/client';

export type Product = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

export interface SaleItem extends PrismaSaleItem {
    product: {
        name: string;
    };
}

export interface Sale extends PrismaSale {
    items: SaleItem[];
}
