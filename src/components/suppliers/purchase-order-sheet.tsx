
"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createPurchaseOrder } from "@/app/suppliers/actions";
import { PurchaseOrderForm } from "./purchase-order-form";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PurchaseOrderSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId: string;
    products: Product[];
}

export type POItem = {
    productId: string;
    name: string;
    quantity: number | string;
    costPrice: number | string;
};

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split('T')[0];
};

export function PurchaseOrderSheet({ isOpen, onOpenChange, supplierId, products }: PurchaseOrderSheetProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [items, setItems] = useState<POItem[]>([]);
    const [expectedDate, setExpectedDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveOrder = async () => {
        if (!user) return toast({ variant: 'destructive', title: 'Authentication Error' });

        if (items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Empty Order',
                description: 'Please add products to the purchase order.'
            });
            return;
        }

        setIsSaving(true);
        const result = await createPurchaseOrder(
            user.id,
            supplierId,
            items.map(i => ({ productId: i.productId, quantity: Number(i.quantity), costPrice: Number(i.costPrice) })),
            expectedDate
        );
        setIsSaving(false);

        if (result.success) {
            toast({
                title: "Purchase Order Created",
                description: "The new purchase order has been saved."
            });
            setItems([]);
            setExpectedDate(undefined);
            onOpenChange(false);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to create purchase order."
            });
        }
    };
    
    const handleClose = () => {
        setItems([]);
        setExpectedDate(undefined);
        onOpenChange(false);
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent className="sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>{t('po.title')}</SheetTitle>
                    <SheetDescription>{t('po.description')}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="expectedDate">{t('po.expectedDelivery')}</Label>
                        <Input
                            id="expectedDate"
                            type="date"
                            value={expectedDate ? formatDateForInput(expectedDate) : ''}
                            onChange={(e) => setExpectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                         />
                    </div>
                    <PurchaseOrderForm
                        products={products}
                        items={items}
                        setItems={setItems}
                    />
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSaving}>{t('pos.cancelButton')}</Button>
                    <Button onClick={handleSaveOrder} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('po.saveOrder')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
