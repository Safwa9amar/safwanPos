
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Supplier, SupplierPayment } from "@prisma/client";
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
import { upsertSupplierPayment, deleteSupplierPayment } from "@/app/suppliers/actions";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

const PaymentSchema = z.object({
    id: z.string().optional(),
    amount: z.coerce.number().positive("Payment amount must be positive"),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof PaymentSchema>;

interface SupplierPaymentSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier;
    payment?: SupplierPayment | null;
}

export function SupplierPaymentSheet({ isOpen, onOpenChange, supplier, payment = null }: SupplierPaymentSheetProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(PaymentSchema),
    });
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = form;

    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if(isOpen) {
            reset(payment || { amount: supplier.balance > 0 ? supplier.balance : undefined, notes: "" });
        }
    }, [isOpen, payment, supplier, reset]);


    const onSubmit = async (data: PaymentFormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error" });
            return;
        }
        
        const formData = new FormData();
        if (payment?.id) formData.append('id', payment.id);
        formData.append('supplierId', supplier.id);
        formData.append('amount', data.amount.toString());
        if (data.notes) formData.append('notes', data.notes);
        formData.append('userId', user.id);
        
        const result = await upsertSupplierPayment(formData);
        
        if (result.success) {
            toast({ title: payment ? 'Payment Updated' : 'Payment Recorded' });
            onOpenChange(false);
        } else {
            toast({ variant: 'destructive', title: 'Payment Failed', description: result.error });
        }
    };
    
    const handleDelete = async () => {
        if (!payment || !user) return;
        setIsDeleting(true);
        const result = await deleteSupplierPayment(payment.id, user.id);
        setIsDeleting(false);

        if (result.success) {
            toast({ title: "Payment Deleted" });
            setIsAlertOpen(false);
            onOpenChange(false);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    }

    return (
        <>
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>{payment ? "Edit" : "Make"} Payment to {supplier.name}</SheetTitle>
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
                    <SheetFooter className="flex-col sm:flex-row sm:justify-between w-full">
                        <div>
                             {payment && (
                                <Button type="button" variant="destructive" onClick={() => setIsAlertOpen(true)} disabled={isSubmitting}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                {t('pos.cancelButton')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('inventory.save')}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this payment?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone and will reverse the payment's effect on the supplier's balance.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                         {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
