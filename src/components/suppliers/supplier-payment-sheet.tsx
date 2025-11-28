
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Supplier } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addSupplierPayment } from "@/app/suppliers/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";

const PaymentSchema = z.object({
    amount: z.coerce.number().positive("Payment amount must be positive"),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof PaymentSchema>;

export function SupplierPaymentSheet({ isOpen, onOpenChange, supplier }: { isOpen: boolean, onOpenChange: (open: boolean) => void, supplier: Supplier }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            amount: supplier.balance > 0 ? supplier.balance : undefined,
            notes: ""
        }
    });
    
    const { register, handleSubmit, formState: { errors }, reset } = form;

    const onSubmit = async (data: PaymentFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error" });
            return;
        }

        setIsSaving(true);
        const formData = new FormData();
        formData.append('supplierId', supplier.id);
        formData.append('amount', data.amount.toString());
        if (data.notes) formData.append('notes', data.notes);
        formData.append('userId', user.id);
        
        const result = await addSupplierPayment(formData);
        setIsSaving(false);
        
        if (result.success) {
            toast({ title: 'Payment Recorded' });
            onOpenChange(false);
            reset();
        } else {
            toast({ variant: 'destructive', title: 'Payment Failed', description: result.error });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>Make Payment to {supplier.name}</SheetTitle>
                        <SheetDescription>Record a payment made to this supplier to reduce your outstanding balance.</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Payment Amount</Label>
                            <Input id="amount" type="number" step="0.01" {...register("amount")} />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea id="notes" {...register("notes")} />
                            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                            {t('pos.cancelButton')}
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('inventory.save')}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
