
"use client";

import { useState, useEffect, useCallback } from "react";
import { Supplier, Product } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createPurchaseOrder } from "@/app/suppliers/actions";
import { PurchaseOrderForm } from "./purchase-order-form";
import { Loader2, FilePlus2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ProductWithCategoryAndBarcodes } from "@/types";

export type POItem = {
    productId: string;
    name: string;
    quantity: number | string;
    costPrice: number | string;
};

type DraftPO = {
    supplierId: string;
    expectedDeliveryDate?: string;
    notes?: string;
    items: POItem[];
}

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split('T')[0];
};

export function NewPurchaseOrderClient({ suppliers, products }: { suppliers: Supplier[], products: ProductWithCategoryAndBarcodes[] }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();

    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
    const [items, setItems] = useState<POItem[]>([]);
    const [expectedDate, setExpectedDate] = useState<Date | undefined>();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const getStorageKey = useCallback(() => {
        if (!selectedSupplierId) return null;
        return `po-draft-${selectedSupplierId}`;
    }, [selectedSupplierId]);

    // Effect to load draft from localStorage when supplier changes
    useEffect(() => {
        const key = getStorageKey();
        if (key) {
            try {
                const savedDraft = localStorage.getItem(key);
                if (savedDraft) {
                    const draft: DraftPO = JSON.parse(savedDraft);
                    setItems(draft.items || []);
                    setExpectedDate(draft.expectedDeliveryDate ? new Date(draft.expectedDeliveryDate) : undefined);
                    setNotes(draft.notes || '');
                    toast({ title: "Draft Loaded", description: "Your previous purchase order draft has been restored." });
                } else {
                    // Clear form when switching to a supplier with no draft
                    setItems([]);
                    setExpectedDate(undefined);
                    setNotes('');
                }
            } catch (error) {
                console.error("Failed to parse draft from localStorage", error);
                localStorage.removeItem(key);
            }
        }
    }, [selectedSupplierId, getStorageKey, toast]);
    
    // Effect to save draft to localStorage on changes
    useEffect(() => {
        const key = getStorageKey();
        if (key) {
            const draft: DraftPO = {
                supplierId: selectedSupplierId,
                items,
                expectedDeliveryDate: expectedDate?.toISOString(),
                notes
            };
            localStorage.setItem(key, JSON.stringify(draft));
        }
    }, [items, expectedDate, notes, selectedSupplierId, getStorageKey]);

    const handleSaveOrder = async () => {
        if (!user) return toast({ variant: 'destructive', title: 'Authentication Error' });
        if (!selectedSupplierId) return toast({ variant: 'destructive', title: 'Supplier not selected' });

        if (items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Empty Order',
                description: 'Please add products to the purchase order.'
            });
            return;
        }

        setIsSaving(true);

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('supplierId', selectedSupplierId);
        formData.append('items', JSON.stringify(items.map(i => ({...i, quantity: Number(i.quantity), costPrice: Number(i.costPrice)}))));
        if (expectedDate) formData.append('expectedDeliveryDate', expectedDate.toISOString());
        if (notes) formData.append('notes', notes);
        
        const result = await createPurchaseOrder(formData);
        setIsSaving(false);

        if (result.success) {
            toast({
                title: "Purchase Order Created",
                description: "The new purchase order has been saved."
            });
            // Clear draft and form
            const key = getStorageKey();
            if (key) localStorage.removeItem(key);
            setItems([]);
            setExpectedDate(undefined);
            setNotes('');
            setSelectedSupplierId('');
            router.push(`/suppliers/${selectedSupplierId}`);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to create purchase order."
            });
        }
    };
    
    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card className="shadow-lg max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FilePlus2/> {t('po.title')}</CardTitle>
                    <CardDescription>{t('po.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="supplier">{t('suppliers.title')}</Label>
                        <Select onValueChange={setSelectedSupplierId} value={selectedSupplierId}>
                            <SelectTrigger id="supplier">
                                <SelectValue placeholder="Select a supplier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedSupplierId && (
                        <>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expectedDate">{t('po.expectedDelivery')}</Label>
                                <Input
                                    id="expectedDate"
                                    type="date"
                                    value={expectedDate ? formatDateForInput(expectedDate) : ''}
                                    onChange={(e) => setExpectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="notes">Notes</Label>
                             <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                        
                        <PurchaseOrderForm
                            products={products}
                            items={items}
                            setItems={setItems}
                        />
                        </>
                    )}

                </CardContent>
                {selectedSupplierId && (
                    <CardContent>
                        <Button onClick={handleSaveOrder} disabled={isSaving || items.length === 0} className="w-full">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('po.saveOrder')}
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
