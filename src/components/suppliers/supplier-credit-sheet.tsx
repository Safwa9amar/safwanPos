
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Supplier, SupplierCredit } from "@prisma/client";
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
import { upsertSupplierCredit } from "@/app/suppliers/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";

const CreditSchema = z.object({
    id: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be positive"),
    reason: z.string().min(1, "A reason is required for this adjustment."),
});

type CreditFormValues = z.infer<typeof CreditSchema>;

interface SupplierCreditSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier;
    credit?: SupplierCredit | null;
}

export function SupplierCreditSheet({ isOpen, onOpenChange, supplier, credit = null }: SupplierCreditSheetProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const form = useForm<CreditFormValues>({
        resolver: zodResolver(CreditSchema),
    });
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = form;

    useEffect(() => {
        if(isOpen) {
            reset(credit || { amount: undefined, reason: "" });
        }
    }, [isOpen, credit, reset]);

    const onSubmit = async (data: CreditFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error" });
            return;
        }

        const formData = new FormData();
        if(credit?.id) formData.append('id', credit.id);
        formData.append('supplierId', supplier.id);
        formData.append('amount', data.amount.toString());
        formData.append('reason', data.reason);
        formData.append('userId', user.id);
        
        const result = await upsertSupplierCredit(formData);
        
        if (result.success) {
            toast({ title: credit ? 'Credit Updated' : 'Credit Recorded' });
            onOpenChange(false);
        } else {
            toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>{credit ? "Edit" : "Add"} Credit/Debt for {supplier.name}</SheetTitle>
                        <SheetDescription>Manually increase the amount you owe to this supplier.</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount to Add</Label>
                            <Input id="amount" type="number" step="0.01" {...register("amount")} />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Adjustment</Label>
                            <Textarea id="reason" {...register("reason")} placeholder="e.g., Accounting adjustment, service fee, etc."/>
                            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {t('pos.cancelButton')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('inventory.save')}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
