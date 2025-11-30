
"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/hooks/use-currency";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

export type POItem = {
    productId: string;
    name: string;
    quantity: number | string;
    costPrice: number | string;
    updateProduct: boolean;
};

interface DirectPurchaseFormProps {
    products: Product[];
    items: POItem[];
    setItems: React.Dispatch<React.SetStateAction<POItem[]>>;
}

export function DirectPurchaseForm({ products, items, setItems }: DirectPurchaseFormProps) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [open, setOpen] = useState(false);
    
    const handleSelectProduct = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product && !items.some(item => item.productId === productId)) {
            setItems(prev => [...prev, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                costPrice: product.costPrice || 0,
                updateProduct: false
            }]);
        }
        setOpen(false);
    };

    const handleUpdateItem = (productId: string, field: 'quantity' | 'costPrice' | 'updateProduct', value: string | boolean) => {
        if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (isNaN(numValue) && value !== '') return;
        }

        setItems(prev => prev.map(item =>
            item.productId === productId
                ? { ...item, [field]: typeof value === 'string' ? (value === '' ? '' : Math.max(0, parseFloat(value))) : value }
                : item
        ));
    };
    
    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const totalCost = items.reduce((sum, item) => sum + (Number(item.costPrice) * Number(item.quantity)), 0);

    return (
        <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {t('po.addProduct')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder={t('po.searchProducts')} />
                        <CommandList>
                            <CommandEmpty>{t('po.noProductsFound')}</CommandEmpty>
                            <CommandGroup >
                                {products.map((product) => (
                                    <CommandItem
                                        key={product.id}
                                        value={product.name}
                                        onSelect={() => handleSelectProduct(product.id)}
                                        disabled={items.some(item => item.productId === product.id)}
                                    >
                                        {product.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {items.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                    <p>{t('po.noProducts')}</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('po.item')}</TableHead>
                            <TableHead className="w-24">{t('po.quantity')}</TableHead>
                            <TableHead className="w-48">{t('po.costPrice')}</TableHead>
                            <TableHead className="w-32 text-right">{t('po.total')}</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.productId}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={e => handleUpdateItem(item.productId, 'quantity', e.target.value)}
                                        className="h-8"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                     <Input
                                        type="number"
                                        step="0.01"
                                        value={item.costPrice}
                                        onChange={e => handleUpdateItem(item.productId, 'costPrice', e.target.value)}
                                        className="h-8"
                                    />
                                     <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`update-${item.productId}`} 
                                            checked={item.updateProduct}
                                            onCheckedChange={(checked) => handleUpdateItem(item.productId, 'updateProduct', !!checked)}
                                        />
                                        <Label htmlFor={`update-${item.productId}`} className="text-xs text-muted-foreground">
                                           Update product cost/sale price
                                        </Label>
                                    </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(Number(item.quantity) * Number(item.costPrice))}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(item.productId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">{t('po.totalCost')}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(totalCost)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            )}
        </div>
    );
}
