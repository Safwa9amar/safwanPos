
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
import { addSupplierCredit } from "@/app/suppliers/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";

const CreditSchema = z.object({
    amount: z.coerce.number().positive("Amount must be positive"),
    reason: z.string().min(1, "A reason is required for this adjustment."),
});

type CreditFormValues = z.infer<typeof CreditSchema>;

export function SupplierCreditSheet({ isOpen, onOpenChange, supplier }: { isOpen: boolean, onOpenChange: (open: boolean) => void, supplier: Supplier }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<CreditFormValues>({
        resolver: zodResolver(CreditSchema),
        defaultValues: {
            amount: undefined,
            reason: ""
        }
    });
    
    const { register, handleSubmit, formState: { errors }, reset } = form;

    const onSubmit = async (data: CreditFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error" });
            return;
        }

        setIsSaving(true);
        const formData = new FormData();
        formData.append('supplierId', supplier.id);
        formData.append('amount', data.amount.toString());
        formData.append('reason', data.reason);
        formData.append('userId', user.id);
        
        const result = await addSupplierCredit(formData);
        setIsSaving(false);
        
        if (result.success) {
            toast({ title: 'Credit/Debt Recorded' });
            onOpenChange(false);
            reset();
        } else {
            toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>Adjust Balance for {supplier.name}</SheetTitle>
                        <SheetDescription>Manually increase the amount you owe to this supplier (add debt).</SheetDescription>
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
