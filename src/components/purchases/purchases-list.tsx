
"use client";

import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from '../ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/context/auth-context';
import { ShoppingCart, MoreVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DirectPurchase } from '@/types';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { deleteDirectPurchase } from '@/app/purchases/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface PurchasesListProps {
    purchases: DirectPurchase[];
}

export function PurchasesList({ purchases }: PurchasesListProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<DirectPurchase | null>(null);

    const handleDeleteClick = (purchase: DirectPurchase) => {
        setSelectedPurchase(purchase);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPurchase || !user) return;

        setIsDeleting(true);
        const result = await deleteDirectPurchase(selectedPurchase.id, user.id);
        setIsDeleting(false);

        if (result.success) {
            toast({ title: "Purchase Deleted" });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsAlertOpen(false);
    };

    if (purchases.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">{t('purchases.no_purchases_title')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('purchases.no_purchases_desc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {purchases.map((purchase) => (
                <Collapsible key={purchase.id} asChild>
                    <Card>
                        <CollapsibleTrigger asChild>
                            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                     <div className="p-3 bg-muted rounded-full">
                                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('purchases.purchase_from')} {purchase.storeName || 'Unknown Store'}</p>
                                        <p className="text-sm text-muted-foreground">{format(new Date(purchase.purchaseDate), "PPP")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg">{formatCurrency(purchase.totalCost)}</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => handleDeleteClick(purchase)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> {t('actions.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="px-4 pb-4">
                                {purchase.notes && <p className="text-sm text-muted-foreground mb-2">Notes: {purchase.notes}</p>}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-center">Quantity</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchase.items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product.name}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.costPrice)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.quantity * item.costPrice)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            ))}
            
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('purchases.delete_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('purchases.delete_confirm_desc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>{t('pos.cancelButton')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                             {isDeleting ? t('inventory.saving') : t('actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
