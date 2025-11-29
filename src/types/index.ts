
import { Sale as PrismaSale, SaleItem as PrismaSaleItem, Supplier as PrismaSupplier, PurchaseOrder as PrismaPurchaseOrder, PurchaseOrderItem as PrismaPurchaseOrderItem, Product as PrismaProduct, Category as PrismaCategory, Customer as PrismaCustomer, Payment as PrismaPayment, User as PrismaUser, Report as PrismaReport, Barcode as PrismaBarcode, SupplierPayment, SupplierCredit, DirectPurchase as PrismaDirectPurchase, DirectPurchaseItem as PrismaDirectPurchaseItem, CapitalEntry as PrismaCapitalEntry } from '@prisma/client';

export type Product = PrismaProduct;
export type Category = PrismaCategory;
export type User = Omit<PrismaUser, 'password'>;
export type Report = PrismaReport;
export type Barcode = PrismaBarcode;
export type CapitalEntry = PrismaCapitalEntry;

export interface ProductWithCategory extends PrismaProduct {
    category: PrismaCategory | null;
}

export interface ProductWithCategoryAndBarcodes extends ProductWithCategory {
    barcodes: Barcode[];
}

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  unit: 'EACH' | 'KG' | 'G' | 'L' | 'ML';
};

export interface SaleItem extends PrismaSaleItem {
    product: {
        name: string;
        unit: string;
    };
}

export interface SaleWithItemsAndCustomer extends PrismaSale {
    items: SaleItem[];
    customer: { name: string } | null;
}

export interface Sale extends PrismaSale {
    items: SaleItem[];
    user: { name: string | null };
    customer: { name: string | null; phone: string | null } | null;
}

export type Supplier = PrismaSupplier;

export interface PurchaseOrderItem extends PrismaPurchaseOrderItem {
    product: Product;
}

export interface PurchaseOrder extends PrismaPurchaseOrder {
    items: PurchaseOrderItem[];
    supplier: Supplier;
}

export interface SupplierWithDetails extends Supplier {
    purchaseOrders: PurchaseOrder[];
    payments: SupplierPayment[];
    credits: SupplierCredit[];
}

export type Customer = PrismaCustomer;
export type Payment = PrismaPayment;

export interface CustomerWithDetails extends Customer {
    sales: SaleWithItemsAndCustomer[];
    payments: Payment[];
}

export interface DirectPurchaseItem extends PrismaDirectPurchaseItem {
    product: Product;
}
export interface DirectPurchase extends PrismaDirectPurchase {
    items: DirectPurchaseItem[];
}
