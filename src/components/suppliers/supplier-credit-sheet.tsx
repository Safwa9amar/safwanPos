
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
import { upsertSupplierCredit, deleteSupplierCredit } from "@/app/suppliers/actions";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

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

    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDelete = async () => {
        if (!credit || !user) return;
        setIsDeleting(true);
        const result = await deleteSupplierCredit(credit.id, user.id);
        setIsDeleting(false);

        if (result.success) {
            toast({ title: "Credit Adjustment Deleted" });
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
                    <SheetFooter className="flex-col sm:flex-row sm:justify-between w-full">
                         <div>
                             {credit && (
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
                    <AlertDialogTitle>Are you sure you want to delete this credit adjustment?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone and will reverse the adjustment's effect on the supplier's balance.
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
