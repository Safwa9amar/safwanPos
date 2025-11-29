
"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createDirectPurchase } from "@/app/purchases/actions";
import { DirectPurchaseForm, POItem } from "./direct-purchase-form";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface DirectPurchaseSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
}

export function DirectPurchaseSheet({ isOpen, onOpenChange, products }: DirectPurchaseSheetProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [items, setItems] = useState<POItem[]>([]);
    const [storeName, setStoreName] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!user) return toast({ variant: 'destructive', title: 'Authentication Error' });

        if (items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Empty Purchase',
                description: 'Please add products to the purchase log.'
            });
            return;
        }

        setIsSaving(true);
        const result = await createDirectPurchase(
            user.id,
            items.map(i => ({ productId: i.productId, quantity: Number(i.quantity), costPrice: Number(i.costPrice) })),
            storeName,
            notes,
        );
        setIsSaving(false);

        if (result.success) {
            toast({
                title: "Purchase Logged",
                description: "The direct purchase has been saved and stock updated."
            });
            handleClose();
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to log purchase."
            });
        }
    };
    
    const handleClose = () => {
        setItems([]);
        setStoreName('');
        setNotes('');
        onOpenChange(false);
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent className="sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>{t('purchases.log_purchase')}</SheetTitle>
                    <SheetDescription>{t('purchases.log_purchase_desc')}</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">{t('purchases.store_name')}</Label>
                            <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g., Local Market" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">{t('purchases.notes')}</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('purchases.notes_placeholder')} />
                    </div>
                    <DirectPurchaseForm
                        products={products}
                        items={items}
                        setItems={setItems}
                    />
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSaving}>{t('pos.cancelButton')}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('purchases.log_and_update_stock')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
