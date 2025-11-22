export type Product = {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

export type Sale = {
    id: number;
    totalAmount: number;
    saleDate: Date;
    items: SaleItem[];
}

export type SaleItem = {
    id: number;
    saleId: number;
    productId: number;
    quantity: number;
    price: number;
}
