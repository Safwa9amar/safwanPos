
"use client";

import { useState } from 'react';
import { PurchaseOrder as POType, PurchaseOrderItem as POItemType } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from '../ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/context/auth-context';
import { Truck } from 'lucide-react';
import { ReceiveStockDialog } from './receive-stock-dialog';

export type PurchaseOrderWithItems = POType & { items: POItemType[] };

interface PurchaseOrderListProps {
    purchaseOrders: PurchaseOrderWithItems[];
}

export function PurchaseOrderList({ purchaseOrders }: PurchaseOrderListProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const [isCompleting, setIsCompleting] = useState<string | null>(null);
    const [receivingOrder, setReceivingOrder] = useState<PurchaseOrderWithItems | null>(null);

    if (purchaseOrders.length === 0) {
        return <p className="text-muted-foreground">{t('suppliers.noPurchaseOrders')}</p>;
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'destructive';
            case 'PARTIALLY_RECEIVED': return 'secondary';
            case 'PENDING':
            default:
                return 'outline';
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
                     {order.status === 'PENDING' || order.status === 'PARTIALLY_RECEIVED' ? (
                        <CardFooter>
                            <Button className="w-full" onClick={() => setReceivingOrder(order)}>
                                <Truck className="mr-2 h-4 w-4" />
                                Receive Stock
                            </Button>
                        </CardFooter>
                    ) : (
                        <CardFooter>
                           <p className="text-xs text-muted-foreground text-center w-full">{t('po.completedNotice')}</p>
                        </CardFooter>
                    )}
                </Card>
            ))}
            
            <ReceiveStockDialog
                isOpen={!!receivingOrder}
                onOpenChange={(isOpen) => !isOpen && setReceivingOrder(null)}
                purchaseOrder={receivingOrder}
            />
        </div>
    );
}
