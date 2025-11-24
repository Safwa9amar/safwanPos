
"use client";

import Image from "next/image";
import { Product } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const { formatCurrency } = useCurrency();
    const isOutOfStock = product.stock <= 0;

    return (
        <Card 
            className={cn(
                "overflow-hidden cursor-pointer flex flex-col transition-all hover:shadow-lg hover:-translate-y-1",
                isOutOfStock && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !isOutOfStock && onAddToCart(product)}
        >
            <CardHeader className="p-0 relative h-32">
                {product.image ? (
                    <Image 
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}
                 {isOutOfStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
                 )}
            </CardHeader>
            <CardContent className="p-3 flex-grow">
                <p className="font-semibold text-sm leading-tight truncate">{product.name}</p>
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-between items-center">
                <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                <span className="text-xs text-muted-foreground">
                    {product.stock} in stock
                </span>
            </CardFooter>
        </Card>
    );
}
