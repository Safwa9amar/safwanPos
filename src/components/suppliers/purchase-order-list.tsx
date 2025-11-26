
"use client";

import { useState } from 'react';
import { PurchaseOrder } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { completePurchaseOrder } from "@/app/suppliers/actions";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from '../ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/context/auth-context';

interface PurchaseOrderListProps {
    purchaseOrders: PurchaseOrder[];
}

export function PurchaseOrderList({ purchaseOrders }: PurchaseOrderListProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const [isCompleting, setIsCompleting] = useState<string | null>(null);

    const handleCompleteOrder = async (orderId: string) => {
        if (!user) return toast({ variant: 'destructive', title: "Authentication Error" });

        setIsCompleting(orderId);
        const result = await completePurchaseOrder(orderId, user.id);
        setIsCompleting(null);

        if (result.success) {
            toast({ title: "Order Completed", description: "Stock levels have been updated." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.error });
        }
    };

    if (purchaseOrders.length === 0) {
        return <p className="text-muted-foreground">{t('suppliers.noPurchaseOrders')}</p>;
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'destructive';
            case 'PENDING':
            default:
                return 'secondary';
        }
    };

    return (
        <div className="space-y-4">
            {purchaseOrders.map(order => (
                <Card key={order.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                                <CardDescription>
                                    {t('po.orderDate')}: {new Date(order.orderDate).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm">
                            <p>{t('po.expectedDelivery')}: {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                            <p className="font-semibold">{t('po.totalCost')}: {formatCurrency(order.totalCost)}</p>
                        </div>
                    </CardContent>
                    {order.status === 'PENDING' && (
                        <CardFooter>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full"
                                        disabled={isCompleting === order.id}
                                    >
                                        {t('po.completeOrder')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('po.completeConfirmTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('po.completeConfirmDescription')}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('pos.cancelButton')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCompleteOrder(order.id)}>
                                            {t('po.confirm')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    )}
                     {order.status === 'COMPLETED' && (
                        <CardFooter>
                           <p className="text-xs text-muted-foreground text-center w-full">{t('po.completedNotice')}</p>
                        </CardFooter>
                    )}
                </Card>
            ))}
        </div>
    );
}
