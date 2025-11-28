
"use client";

import { useState } from 'react';
import { PurchaseOrder as POType, PurchaseOrderItem as POItemType, Product, SupplierPayment, SupplierCredit } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from '../ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/context/auth-context';
import { Truck, HandCoins, DollarSign } from 'lucide-react';
import { ReceiveStockDialog } from './receive-stock-dialog';
import { format } from 'date-fns';

export type PurchaseOrderItemWithProduct = POItemType & { product: Product };
export type PurchaseOrderWithItems = POType & { items: PurchaseOrderItemWithProduct[] };

type HistoryEntry = 
    | { type: 'purchase', date: Date, data: PurchaseOrderWithItems }
    | { type: 'payment', date: Date, data: SupplierPayment }
    | { type: 'credit', date: Date, data: SupplierCredit };


interface PurchaseOrderListProps {
    purchaseOrders: HistoryEntry[];
}

export function PurchaseOrderList({ purchaseOrders }: PurchaseOrderListProps) {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
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
    
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'purchase': return <Truck className="h-5 w-5" />;
            case 'payment': return <DollarSign className="h-5 w-5 text-green-600" />;
            case 'credit': return <HandCoins className="h-5 w-5 text-red-600" />;
            default: return null;
        }
    }
    
    const getTypeTitle = (entry: HistoryEntry) => {
        switch (entry.type) {
            case 'purchase': return `Order #${entry.data.id.substring(0, 8)}`;
            case 'payment': return 'Payment Made';
            case 'credit': return `Credit / Debt Adjustment`;
            default: return 'Transaction';
        }
    }

    return (
        <div className="space-y-4">
            {purchaseOrders.map((entry, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                {getTypeIcon(entry.type)}
                                <div>
                                    <CardTitle className="text-lg">{getTypeTitle(entry)}</CardTitle>
                                    <CardDescription>
                                        {format(new Date(entry.date), "PPP p")}
                                    </CardDescription>
                                </div>
                            </div>
                           {entry.type === 'purchase' && <Badge variant={getStatusVariant(entry.data.status)}>{entry.data.status}</Badge>}
                           {entry.type === 'payment' && <span className="font-bold text-lg text-green-600">-{formatCurrency(entry.data.amount)}</span>}
                           {entry.type === 'credit' && <span className="font-bold text-lg text-red-600">+{formatCurrency(entry.data.amount)}</span>}
                        </div>
                    </CardHeader>
                    {entry.type === 'purchase' && (
                        <>
                         <CardContent>
                            <p className="font-semibold text-right">{t('po.totalCost')}: {formatCurrency(entry.data.totalCost)}</p>
                        </CardContent>
                        {entry.data.status === 'PENDING' || entry.data.status === 'PARTIALLY_RECEIVED' ? (
                            <CardFooter>
                                <Button className="w-full" onClick={() => setReceivingOrder(entry.data)}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Receive Stock
                                </Button>
                            </CardFooter>
                        ) : null}
                        </>
                    )}
                    {(entry.type === 'payment' || entry.type === 'credit') && entry.data.notes && (
                         <CardContent>
                             <p className="text-sm text-muted-foreground pt-2">Notes: {(entry.data as any).notes || (entry.data as any).reason}</p>
                        </CardContent>
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

