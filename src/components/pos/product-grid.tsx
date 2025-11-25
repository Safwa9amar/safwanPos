
"use client";

import { Product } from "@prisma/client";
import { ProductWithCategory } from "@/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
    products: ProductWithCategory[];
    onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {products.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onProductSelect={onAddToCart}
                />
            ))}
        </div>
    )
}
