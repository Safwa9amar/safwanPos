"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CartSummary } from './cart-summary';
import { CompleteSaleDialog } from './complete-sale-dialog';
import { completeSale } from '@/app/pos/actions';
import { Receipt } from './receipt';
import { Loader2, Scan } from 'lucide-react';

type CompletedSale = {
  id: number;
  saleDate: Date;
  totalAmount: number;
  items: {
    quantity: number;
    price: number;
    product: {
      name: string;
    }
  }[];
}

export function PosPageClient() {
  const cart = useCart();
  const { toast } = useToast();
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastSale, setLastSale] = useState<CompletedSale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeScan = useCallback(async () => {
    if (!barcode) return;
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/${barcode}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const product: Product = await response.json();
      cart.addItem(product);
      setBarcode('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "Product with this barcode not found.",
      });
    } finally {
      setIsSearching(false);
      barcodeInputRef.current?.focus();
    }
  }, [barcode, cart, toast]);

  const handleCompleteSale = async () => {
    if (cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to the cart before completing a sale.",
      });
      return;
    }
    
    setIsCompleting(true);
    try {
      const result = await completeSale(cart.items);
      if (result.success && result.sale) {
        setLastSale(result.sale);
        setShowReceipt(true);
        cart.clearCart();
        toast({
          title: "Sale Completed",
          description: `Sale #${result.sale.id} has been recorded.`,
        });
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sale Failed",
        description: error.message,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  if (showReceipt && lastSale) {
    return <Receipt sale={lastSale} onDone={() => {
        setShowReceipt(false);
        setLastSale(null);
    }} />;
  }
  
  return (
    <div className="grid lg:grid-cols-3 gap-4 p-4 h-full max-h-full overflow-hidden">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Scan Product</CardTitle>
            <CardDescription>Enter a product barcode to add it to the sale.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleBarcodeScan(); }}>
              <div className="flex gap-2">
                <Input
                  ref={barcodeInputRef}
                  placeholder="Enter or scan barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={isSearching}
                />
                <Button type="submit" disabled={isSearching || !barcode} className="min-w-[100px]">
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Scan className="mr-2 h-4 w-4" />}
                  {isSearching ? '' : 'Add'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-4 h-full max-h-full">
        <div className="flex-grow min-h-0">
          <CartSummary cart={cart} />
        </div>
        <div>
          <CompleteSaleDialog onConfirm={handleCompleteSale} cart={cart} isCompleting={isCompleting}/>
        </div>
      </div>
    </div>
  );
}
