
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
import { Truck, HandCoins, DollarSign, Printer, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { ReceiveStockDialog } from './receive-stock-dialog';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cairoFont } from '@/lib/cairo-font';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { deletePurchaseOrder } from '@/app/suppliers/actions';
import { useRouter } from 'next/navigation';

export type PurchaseOrderItemWithProduct = POItemType & { product: Product };
export type PurchaseOrderWithItems = POType & { items: PurchaseOrderItemWithProduct[] };

export type HistoryEntry = 
    | { type: 'purchase', date: Date, data: PurchaseOrderWithItems }
    | { type: 'payment', date: Date, data: SupplierPayment }
    | { type: 'credit', date: Date, data: SupplierCredit };


interface PurchaseOrderListProps {
    purchaseOrders: HistoryEntry[];
    onEditPayment: (payment: SupplierPayment) => void;
    onEditCredit: (credit: SupplierCredit) => void;
}

export function PurchaseOrderList({ purchaseOrders, onEditPayment, onEditCredit }: PurchaseOrderListProps) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { formatCurrency } = useCurrency();
    const [receivingOrder, setReceivingOrder] = useState<PurchaseOrderWithItems | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPo, setSelectedPo] = useState<PurchaseOrderWithItems | null>(null);

    const handlePrint = (po: PurchaseOrderWithItems) => {
        const doc = new jsPDF();
        const printT = (key: string) => i18n.getFixedT('en')(key);
        
        doc.setFontSize(22);
        doc.text("SafwanPOS", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(printT('po.title'), doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

        doc.setFontSize(10);
        const poIdText = `${printT('po.orderId')}: #${po.id.substring(0,8)}`;
        const dateText = `${printT('po.orderDate')}: ${new Date(po.orderDate).toLocaleDateString()}`;
        
        doc.text(poIdText, 15, 40);
        doc.text(dateText, 15, 45);

        const tableData = po.items.map(item => [
            item.product.name,
            item.quantity,
            formatCurrency(item.costPrice),
            formatCurrency(item.quantity * item.costPrice)
        ]);

        const head = [[printT('po.item'), printT('po.quantity'), printT('po.costPrice'), printT('po.total')]];
        
        autoTable(doc, {
            startY: 55,
            head: head,
            body: tableData,
            theme: 'striped',
        });
        
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        const totalText = `${printT('po.totalCost')}: ${formatCurrency(po.totalCost)}`;
        doc.text(totalText, doc.internal.pageSize.getWidth() - 15, finalY, { align: 'right' });
        

        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    };

    const handleDeleteClick = (po: PurchaseOrderWithItems) => {
        setSelectedPo(po);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPo || !user) return;

        setIsDeleting(true);
        const result = await deletePurchaseOrder(selectedPo.id, user.id);
        setIsDeleting(false);

        if (result.success) {
            toast({ title: "Purchase Order Deleted" });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsAlertOpen(false);
    };

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
            case 'purchase': return `${t('po.order')} #${entry.data.id.substring(0, 8)}`;
            case 'payment': return t('suppliers.paymentMade');
            case 'credit': return t('suppliers.creditAdjustment');
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
                           <div className="flex items-center gap-2">
                               {entry.type === 'purchase' && <Badge variant={getStatusVariant(entry.data.status)}>{t(`po.statuses.${entry.data.status}`)}</Badge>}
                               {entry.type === 'payment' && <span className="font-bold text-lg text-green-600">-{formatCurrency(entry.data.amount)}</span>}
                               {entry.type === 'credit' && <span className="font-bold text-lg text-red-600">+{formatCurrency(entry.data.amount)}</span>}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {entry.type === 'purchase' && (
                                            <>
                                                <DropdownMenuItem onSelect={() => handlePrint(entry.data)}>
                                                    <Printer className="mr-2 h-4 w-4" /> {t('actions.print')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onSelect={() => handleDeleteClick(entry.data)} 
                                                    disabled={entry.data.status !== 'PENDING'}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> {t('actions.delete')}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {entry.type === 'payment' && (
                                            <DropdownMenuItem onSelect={() => onEditPayment(entry.data)}>
                                                <Pencil className="mr-2 h-4 w-4"/> {t('actions.edit')}
                                            </DropdownMenuItem>
                                        )}
                                         {entry.type === 'credit' && (
                                            <DropdownMenuItem onSelect={() => onEditCredit(entry.data)}>
                                                <Pencil className="mr-2 h-4 w-4"/> {t('actions.edit')}
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                           </div>
                        </div>
                    </CardHeader>
                    {entry.type === 'purchase' && entry.data.status !== 'CANCELLED' && (
                         <CardContent>
                            <p className="font-semibold text-right">{t('po.totalCost')}: {formatCurrency(entry.data.totalCost)}</p>
                        </CardContent>
                    )}
                    {entry.type === 'purchase' && (entry.data.status === 'PENDING' || entry.data.status === 'PARTIALLY_RECEIVED') && (
                        <CardFooter>
                            <Button className="w-full" onClick={() => setReceivingOrder(entry.data)}>
                                <Truck className="mr-2 h-4 w-4" />
                                {t('po.receiveStock')}
                            </Button>
                        </CardFooter>
                    )}
                    {(entry.type === 'payment' || entry.type === 'credit') && ((entry.data as SupplierPayment).notes || (entry.data as SupplierCredit).reason) && (
                         <CardContent>
                             <p className="text-sm text-muted-foreground pt-2">{t('suppliers.paymentNotes')}: {(entry.data as SupplierPayment).notes || (entry.data as SupplierCredit).reason}</p>
                        </CardContent>
                    )}
                </Card>
            ))}
            
            <ReceiveStockDialog
                isOpen={!!receivingOrder}
                onOpenChange={(isOpen) => !isOpen && setReceivingOrder(null)}
                purchaseOrder={receivingOrder}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('po.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('po.deleteConfirmDescription', {id: selectedPo?.id.substring(0,8)})}</AlertDialogDescription>
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
