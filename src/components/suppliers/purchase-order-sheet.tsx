"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createPurchaseOrder } from "@/app/suppliers/actions";
import { PurchaseOrderForm } from "./purchase-order-form";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PurchaseOrderSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId: string;
    products: Product[];
}

export type POItem = {
    productId: string;
    name: string;
    quantity: number;
    costPrice: number;
};

export function PurchaseOrderSheet({ isOpen, onOpenChange, supplierId, products }: PurchaseOrderSheetProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [items, setItems] = useState<POItem[]>([]);
    const [expectedDate, setExpectedDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveOrder = async () => {
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
            supplierId,
            items.map(i => ({ productId: i.productId, quantity: i.quantity, costPrice: i.costPrice })),
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
                <div className="py-4">
                    <div className="mb-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !expectedDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expectedDate ? format(expectedDate, "PPP") : <span>{t('po.expectedDelivery')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={expectedDate}
                                onSelect={setExpectedDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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
