
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Product, Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Folder, Search } from "lucide-react";
import { ProductTable } from "./product-table";
import { ProductSheet } from "./product-sheet";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { ProductWithCategory } from "@/types";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

const INITIAL_INFINITE_LOAD = 50;
const SUBSEQUENT_INFINITE_LOAD = 25;

export function InventoryPageClient({ initialProducts, categories }: { initialProducts: ProductWithCategory[], categories: Category[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
  const [visibleCount, setVisibleCount] = useState(INITIAL_INFINITE_LOAD);
  
  const observer = useRef<IntersectionObserver>();
  
  const lastElementRef = useCallback((node: HTMLTableRowElement) => {
    if (itemsPerPage !== 'all') return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + SUBSEQUENT_INFINITE_LOAD);
      }
    });
    if (node) observer.current.observe(node);
  }, [itemsPerPage]);


  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setEditingProduct(null);
    setIsSheetOpen(false);
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = initialProducts.filter(product => {
        const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'stock-asc':
                return a.stock - b.stock;
            case 'stock-desc':
                return b.stock - a.stock;
            default:
                return 0;
        }
    });

  }, [initialProducts, searchTerm, filterCategory, sortBy]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(INITIAL_INFINITE_LOAD);
  }, [searchTerm, filterCategory, sortBy, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === 'all') {
      return filteredAndSortedProducts.slice(0, visibleCount);
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage, visibleCount]);
  
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }
  
  const handleItemsPerPageChange = (value: string) => {
      setItemsPerPage(value === 'all' ? 'all' : Number(value));
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>{t("inventory.title")}</CardTitle>
            <CardDescription>{t("inventory.description")}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => router.push('/inventory/categories')} className="justify-center">
                <Folder className="mr-2 h-4 w-4" />
                {t('inventory.manageCategories')}
            </Button>
            <Button onClick={handleAddProduct} className="justify-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("inventory.addProduct")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder={t('inventory.searchPlaceholder')}
                        className="pl-9 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder={t('inventory.filterByCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
                            <SelectItem value="__none__">{t('inventory.noCategory')}</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder={t('inventory.sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name-asc">{t('inventory.sort.nameAsc')}</SelectItem>
                            <SelectItem value="name-desc">{t('inventory.sort.nameDesc')}</SelectItem>
                            <SelectItem value="price-asc">{t('inventory.sort.priceAsc')}</SelectItem>
                            <SelectItem value="price-desc">{t('inventory.sort.priceDesc')}</SelectItem>
                            <SelectItem value="stock-asc">{t('inventory.sort.stockAsc')}</SelectItem>
                            <SelectItem value="stock-desc">{t('inventory.sort.stockDesc')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          <ProductTable products={paginatedProducts} onEdit={handleEditProduct} lastElementRef={lastElementRef}/>
          
           <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                    Showing {paginatedProducts.length} of {filteredAndSortedProducts.length} products.
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Rows per page:</span>
                        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {itemsPerPage !== 'all' && totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage - 1)}} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                                </PaginationItem>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href="#" onClick={(e) => {e.preventDefault(); handlePageChange(page)}} isActive={page === currentPage}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage + 1)}} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
           </div>
        </CardContent>
      </Card>

      <ProductSheet
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}
