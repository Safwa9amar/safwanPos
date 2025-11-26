'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PackagePlus, Search, Telescope } from 'lucide-react';
import { findProducts, ProductSearchOutput } from '@/ai/flows/product-search-flow';
import { ProductSheet } from '../inventory/product-sheet';
import { Category, Product } from '@prisma/client';
import Image from 'next/image';

const searchSchema = z.object({
  query: z.string().min(3, 'Please enter at least 3 characters.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function ProductDiscoveryClient({ categories }: { categories: Category[] }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProductSearchOutput['products']>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [productToAdd, setProductToAdd] = useState<Partial<Product> | null>(null);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    setResults([]);
    try {
      const response = await findProducts({ query: data.query });
      if (response.products && response.products.length > 0) {
        setResults(response.products);
      } else {
        toast({
          title: 'No Products Found',
          description: 'The AI could not find any products matching your query.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to search for products.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToInventory = (product: ProductSearchOutput['products'][0]) => {
    setProductToAdd({
        name: product.name,
        image: product.imageUrl,
    });
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setIsSheetOpen(false);
    setProductToAdd(null);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>AI Product Discovery</CardTitle>
          <CardDescription>
            Describe a product or category you want to sell, and the AI will find potential products for you to add to your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <div className="grid gap-2 flex-1">
                <Input
                id="query"
                placeholder="e.g., 'organic green apples' or 'latest gaming headphones'"
                {...form.register('query')}
                disabled={isLoading}
                />
                {form.formState.errors.query && (
                <p className="text-sm text-destructive">{form.formState.errors.query.message}</p>
                )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-32">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Discover
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
             <Card key={i} className="animate-pulse">
                <CardHeader className="p-0 h-40 bg-muted rounded-t-lg"></CardHeader>
                <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
             </Card>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.map((product, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="p-0 relative h-40">
                  <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" className="rounded-t-lg bg-muted" />
              </CardHeader>
              <CardContent className="p-4 flex-grow space-y-1">
                <CardTitle className="text-base">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="text-xs text-muted-foreground">Suggested Category: {product.category}</div>
              </CardContent>
              <CardContent className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleAddToInventory(product)}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Add to Inventory
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && (
          <div className="text-center text-muted-foreground py-20 flex flex-col items-center">
              <Telescope className="h-16 w-16 mb-4" />
              <p className="font-semibold">Ready to discover new products?</p>
              <p className="text-sm">Use the search bar above to get started.</p>
          </div>
      )}
      
      <ProductSheet 
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        product={productToAdd as Product | null}
        categories={categories}
      />
    </div>
  );
}
