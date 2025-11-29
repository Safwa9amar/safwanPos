
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
    const { t, language } = useTranslation();
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
        const isArabic = language === 'ar';

        doc.addFileToVFS('Cairo-Regular-normal.ttf', cairoFont);
        doc.addFont('Cairo-Regular-normal.ttf', 'Cairo', 'normal');

        if (isArabic) {
            doc.setFont('Cairo');
            doc.setR2L(true);
        }
        
        doc.setFontSize(22);
        doc.text("SafwanPOS", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text("Purchase Order", doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

        doc.setFontSize(10);
        const poIdText = `PO ID: #${po.id.substring(0,8)}`;
        const dateText = `Order Date: ${new Date(po.orderDate).toLocaleDateString()}`;
        
        if (isArabic) {
            doc.text(poIdText, doc.internal.pageSize.getWidth() - 15, 40, { align: 'right' });
            doc.text(dateText, doc.internal.pageSize.getWidth() - 15, 45, { align: 'right' });
        } else {
            doc.text(poIdText, 15, 40);
            doc.text(dateText, 15, 45);
        }

        const tableData = po.items.map(item => [
            isArabic ? (item.product.name.split('').reverse().join('')) : item.product.name,
            item.quantity,
            formatCurrency(item.costPrice),
            formatCurrency(item.quantity * item.costPrice)
        ]);

        const head = [[t('po.item'), t('po.quantity'), t('po.costPrice'), t('po.total')]];
        
        autoTable(doc, {
            startY: 55,
            head: head,
            body: tableData,
            theme: 'striped',
            headStyles: {
                font: isArabic ? 'Cairo' : 'helvetica',
                halign: isArabic ? 'right' : 'left'
            },
            bodyStyles: {
                font: isArabic ? 'Cairo' : 'helvetica',
                halign: isArabic ? 'right' : 'left'
            },
            didDrawPage: (data) => {
                 if (isArabic) {
                    data.table.body.forEach(row => {
                        row.cells[1].styles.halign = 'left';
                        row.cells[2].styles.halign = 'left';
                        row.cells[3].styles.halign = 'left';
                    });
                }
            }
        });
        
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        if(isArabic) doc.setFont('Cairo', 'bold');

        const totalText = `${t('po.totalCost')}: ${formatCurrency(po.totalCost)}`;
        if (isArabic) {
             doc.text(totalText, 15, finalY, { align: 'left' });
        } else {
            doc.text(totalText, doc.internal.pageSize.getWidth() - 15, finalY, { align: 'right' });
        }

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
                           <div className="flex items-center gap-2">
                               {entry.type === 'purchase' && <Badge variant={getStatusVariant(entry.data.status)}>{entry.data.status}</Badge>}
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
                                                    <Printer className="mr-2 h-4 w-4" /> Print
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onSelect={() => handleDeleteClick(entry.data)} 
                                                    disabled={entry.data.status !== 'PENDING'}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {entry.type === 'payment' && (
                                            <DropdownMenuItem onSelect={() => onEditPayment(entry.data)}>
                                                <Pencil className="mr-2 h-4 w-4"/> Edit
                                            </DropdownMenuItem>
                                        )}
                                         {entry.type === 'credit' && (
                                            <DropdownMenuItem onSelect={() => onEditCredit(entry.data)}>
                                                <Pencil className="mr-2 h-4 w-4"/> Edit
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
                                Receive Stock
                            </Button>
                        </CardFooter>
                    )}
                    {(entry.type === 'payment' || entry.type === 'credit') && (entry.data as any).notes && (
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

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete PO #{selectedPo?.id.substring(0,8)}. This action cannot be undone and will reverse the balance increase on the supplier.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
