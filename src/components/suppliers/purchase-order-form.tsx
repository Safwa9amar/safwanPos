
"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { POItem } from "./purchase-order-sheet";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface PurchaseOrderFormProps {
    products: Product[];
    items: POItem[];
    setItems: React.Dispatch<React.SetStateAction<POItem[]>>;
}

export function PurchaseOrderForm({ products, items, setItems }: PurchaseOrderFormProps) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    
    const handleSelectProduct = (productId: string) => {
        if (!productId) return;
        const product = products.find(p => p.id === productId);
        if (product && !items.some(item => item.productId === productId)) {
            setItems(prev => [...prev, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                costPrice: 0, // Default cost price, can be edited
            }]);
        }
    };

    const handleUpdateItem = (productId: string, field: 'quantity' | 'costPrice', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== '') return;

        setItems(prev => prev.map(item =>
            item.productId === productId
                ? { ...item, [field]: value === '' ? '' : Math.max(0, numValue) }
                : item
        ));
    };
    
    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    const totalCost = items.reduce((sum, item) => sum + (Number(item.costPrice) * Number(item.quantity)), 0);
    const availableProducts = products.filter(p => !items.some(item => item.productId === p.id));

    return (
        <div className="space-y-4">
            <Select onValueChange={handleSelectProduct} value="">
                <SelectTrigger>
                    <SelectValue placeholder={t('po.addProduct')} />
                </SelectTrigger>
                <SelectContent>
                    {availableProducts.length > 0 ? (
                        availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                                {product.name}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="none" disabled>{t('po.noProductsFound')}</SelectItem>
                    )}
                </SelectContent>
            </Select>

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
                            <TableHead className="w-32">{t('po.costPrice')}</TableHead>
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
                                     <Input
                                        type="number"
                                        step="0.01"
                                        value={item.costPrice}
                                        onChange={e => handleUpdateItem(item.productId, 'costPrice', e.target.value)}
                                        className="h-8"
                                    />
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
