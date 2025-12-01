
"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useMultiCart } from '@/hooks/use-multi-cart';
import { Product, Category, Customer, User } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CartSummary } from './cart-summary';
import { CompleteSaleDialog } from './complete-sale-dialog';
import { completeSale } from '@/app/pos/actions';
import { Receipt } from './receipt';
import { Loader2, Scan, PackageSearch, Search, X, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sale, ProductWithCategory } from '@/types';
import { ProductGrid } from './product-grid';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WeightInputDialog } from './weight-input-dialog';
import { useAuth } from '@/context/auth-context';

export function PosPageClient({ initialProducts, categories, customers }: { initialProducts: ProductWithCategory[], categories: Category[], customers: Customer[] }) {
  const { user } = useAuth();
  const cart = useMultiCart();
  const { toast } = useToast();
  const { t } = useTranslation("translation");
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const focusBarcode = useCallback(() => {
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  }, []);

  const handleBarcodeScan = useCallback(async () => {
    if (!barcode || !user) return;
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/${barcode}`);
      if (!response.ok) {
        throw new Error(t('pos.productNotFound'));
      }
      const product: Product = await response.json();
      
      if (product.unit !== 'EACH') {
          setSelectedProductForWeight(product);
          setIsWeightModalOpen(true);
      } else {
          cart.addItem(product);
          focusBarcode();
      }
      setBarcode('');

    } catch (error) {
      toast({
        variant: "destructive",
        title: t('pos.scanError'),
        description: t('pos.productNotFound'),
      });
      focusBarcode();
    } finally {
      setIsSearching(false);
    }
  }, [barcode, cart, toast, t, user, focusBarcode]);

  const handleAddToCart = (product: Product) => {
    if (product.unit === 'EACH') {
        cart.addItem(product);
        focusBarcode();
    } else {
        setSelectedProductForWeight(product);
        setIsWeightModalOpen(true);
    }
  };

  const handleWeightSubmit = (product: Product, weight: number) => {
    cart.addItem(product, weight);
    setIsWeightModalOpen(false);
    setSelectedProductForWeight(null);
    focusBarcode();
  };

  const onWeightModalClose = (isOpen: boolean) => {
    setIsWeightModalOpen(isOpen);
    if (!isOpen) {
      focusBarcode();
    }
  }


  const handleCompleteSale = async (paymentType: "CASH" | "CARD" | "CREDIT", customerId?: string, amountPaid?: number, discount?: number) => {
    if (!user) return toast({ variant: "destructive", title: "Authentication Error" });

    if (cart.activeCart.items.length === 0) {
      toast({ title: t('pos.emptyCartTitle'), description: t('pos.emptyCartDescription') });
      return;
    }
    
    if (paymentType === 'CREDIT' && !customerId) {
        toast({ variant: "destructive", title: t('pos.customerRequiredTitle'), description: t('pos.customerRequiredDescription') });
        return;
    }

    setIsCompleting(true);
    try {
      const result = await completeSale(user.id, cart.activeCart.items, paymentType, customerId, amountPaid, discount);
      if (result.success && result.sale) {
        // @ts-ignore
        setLastSale(result.sale);
        setShowReceipt(true);
        cart.clearCart();
        toast({
          title: t('pos.saleCompletedTitle'),
          description: `${t('pos.saleCompletedDescription')} #${result.sale.id.substring(0,8)}`,
        });
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('pos.saleFailedTitle'),
        description: error.message,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    })
  }, [initialProducts, searchTerm, selectedCategory]);

  useEffect(() => {
    focusBarcode();
  }, [cart.activeCartIndex, focusBarcode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F1-F9 to switch carts
      if (event.key.startsWith('F') && !isNaN(Number(event.key.substring(1)))) {
        const keyNumber = parseInt(event.key.substring(1), 10);
        if (keyNumber >= 1 && keyNumber <= 9) {
          event.preventDefault();
          const targetCartIndex = keyNumber - 1;
          cart.switchToOrAddCart(targetCartIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cart]);


  if (showReceipt && lastSale) {
    return <Receipt sale={lastSale} onDone={() => {
        setShowReceipt(false);
        setLastSale(null);
        focusBarcode();
    }} />;
  }
  
  return (
    <div className="grid lg:grid-cols-[1fr_480px] gap-4 p-4 h-[calc(100vh-64px)] max-h-full overflow-hidden">
      <div className="flex flex-col gap-4 overflow-hidden">
        <Card>
          <CardHeader>
            <CardTitle>{t('pos.scanProductTitle')}</CardTitle>
            <CardDescription>{t('pos.scanProductDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleBarcodeScan(); }}>
              <div className="flex gap-2">
                <Input
                  ref={barcodeInputRef}
                  placeholder={t('pos.scanPlaceholder')}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={isSearching}
                />
                <Button type="submit" disabled={isSearching || !barcode} className="min-w-[100px]">
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Scan className="mr-2 h-4 w-4" />}
                  {isSearching ? '' : t('pos.addButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="flex-grow overflow-hidden flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <PackageSearch />
                        {t('pos.productsTitle')}
                    </CardTitle>
                    <div className="flex gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="search"
                                placeholder={t('pos.searchProductsPlaceholder')}
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('pos.allCategories')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('pos.allCategories')}</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-2">
                <ScrollArea className="h-full">
                    <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
                </ScrollArea>
            </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 h-full max-h-full">
        <div className="flex-grow min-h-0">
           <Card className="flex flex-col h-full shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TooltipProvider>
                        {cart.carts.map((_, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={cart.activeCartIndex === index ? 'secondary' : 'ghost'}
                                size="sm"
                                className="relative pr-2"
                                onClick={(e) => {
                                  if ((e.target as HTMLElement).closest('.delete-cart-btn')) {
                                    return;
                                  }
                                  cart.switchCart(index);
                                }}
                              >
                                Cart {index + 1}
                                {cart.carts.length > 1 && (
                                  <div
                                    className="delete-cart-btn absolute -top-1 -right-1 p-0.5 rounded-full bg-muted-foreground/30 hover:bg-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cart.removeCart(index);
                                    }}
                                  >
                                    <X className="h-3 w-3 text-background" />
                                  </div>
                                )}
                              </Button>
                            </TooltipTrigger>
                            {index < 9 && (
                              <TooltipContent>
                                <p>Shortcut: F{index + 1}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        ))}
                        {cart.carts.length < 9 && (
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={cart.addCart}>
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        )}
                      </TooltipProvider>
                    </div>
                </CardHeader>
                <CartSummary cart={cart} />
            </Card>
        </div>
        <div>
          <CompleteSaleDialog 
            onConfirm={handleCompleteSale} 
            cart={cart} 
            isCompleting={isCompleting}
            customers={customers}
            />
        </div>
      </div>
      <WeightInputDialog 
        isOpen={isWeightModalOpen}
        onOpenChange={onWeightModalClose}
        product={selectedProductForWeight}
        onConfirm={handleWeightSubmit}
      />
    </div>
  );
}
