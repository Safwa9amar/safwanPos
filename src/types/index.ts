import { Sale as PrismaSale, SaleItem as PrismaSaleItem, Supplier as PrismaSupplier, PurchaseOrder as PrismaPurchaseOrder, PurchaseOrderItem as PrismaPurchaseOrderItem, Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';

export type Product = PrismaProduct;
export type Category = PrismaCategory;

export interface ProductWithCategory extends PrismaProduct {
    category: PrismaCategory | null;
}

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

export type Supplier = PrismaSupplier;

export interface PurchaseOrderItem extends PrismaPurchaseOrderItem {
    product: Product;
}

export interface PurchaseOrder extends PrismaPurchaseOrder {
    items: PurchaseOrderItem[];
    supplier: Supplier;
}
