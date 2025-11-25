
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer } from "@prisma/client";
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
import { addPayment } from "@/app/customers/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const PaymentSchema = z.object({
    amount: z.coerce.number().positive("Payment amount must be positive"),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof PaymentSchema>;

export function PaymentSheet({ isOpen, onOpenChange, customer }: { isOpen: boolean, onOpenChange: (open: boolean) => void, customer: Customer }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            amount: customer.balance > 0 ? customer.balance : undefined,
            notes: ""
        }
    });
    
    const { register, handleSubmit, formState: { errors }, reset } = form;

    const onSubmit = async (data: PaymentFormValues) => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('customerId', customer.id);
        formData.append('amount', data.amount.toString());
        if (data.notes) formData.append('notes', data.notes);
        
        const result = await addPayment(formData);
        setIsSaving(false);
        
        if (result.success) {
            toast({ title: t('customers.paymentSuccessTitle') });
            onOpenChange(false);
            reset();
        } else {
            toast({ variant: 'destructive', title: t('customers.paymentFailedTitle'), description: result.error });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>{t('customers.addPaymentFor', { name: customer.name })}</SheetTitle>
                        <SheetDescription>{t('customers.addPaymentDescription')}</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t('customers.paymentAmount')}</Label>
                            <Input id="amount" type="number" step="0.01" {...register("amount")} />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="notes">{t('customers.paymentNotes')}</Label>
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
