
"use client";

import { useState, useMemo, useEffect } from "react";
import { SaleWithItemsAndCustomer } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search, Eye, Download, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "@/components/ui/badge";
import { format, startOfDay, endOfDay } from "date-fns";
import { Input } from "../ui/input";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { getSalesHistory, deleteSale } from "@/app/reports/actions";
import { SaleDetailDialog } from "./sale-detail-dialog";
import { useAuth } from "@/context/auth-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function SalesHistoryClient({ initialSales }: { initialSales: SaleWithItemsAndCustomer[] }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<SaleWithItemsAndCustomer[]>(initialSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedSale, setSelectedSale] = useState<SaleWithItemsAndCustomer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<SaleWithItemsAndCustomer | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchSales = async () => {
        setIsLoading(true);
        const { sales: fetchedSales, error } = await getSalesHistory(user.id, { 
          dateFrom: date?.from, 
          dateTo: date?.to 
        });
        if (fetchedSales) setSales(fetchedSales);
        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error });
        }
        setIsLoading(false);
      };
      fetchSales();
    }
  }, [date, user, toast]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const search = searchTerm.toLowerCase();
      return (
        sale.id.toLowerCase().includes(search) ||
        sale.customer?.name?.toLowerCase().includes(search) ||
        sale.paymentType.toLowerCase().includes(search)
      );
    });
  }, [sales, searchTerm]);
  
  const handleViewDetails = (sale: SaleWithItemsAndCustomer) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };
  
  const handleDeleteClick = (sale: SaleWithItemsAndCustomer) => {
    setSaleToDelete(sale);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
      if (!saleToDelete || !user) return;
      setIsDeleting(true);
      const result = await deleteSale(saleToDelete.id, user.id);
      setIsDeleting(false);
      if (result.success) {
          toast({ title: "Sale Deleted", description: `Sale #${saleToDelete.id.substring(0, 8)} has been deleted.` });
          setSales(prev => prev.filter(s => s.id !== saleToDelete.id));
          setIsAlertOpen(false);
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
  }
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CREDIT': return 'destructive';
      case 'CARD': return 'secondary';
      case 'CASH':
      default:
        return 'outline';
    }
  };
  
  const { formatCurrency } = useCurrency();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('history.title')}</CardTitle>
          <CardDescription>{t('history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('history.searchPlaceholder')}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>{t('history.pickDate')}</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                 <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('history.saleId')}</TableHead>
                <TableHead>{t('history.date')}</TableHead>
                <TableHead>{t('history.customer')}</TableHead>
                <TableHead>{t('history.paymentType')}</TableHead>
                <TableHead className="text-right">{t('history.total')}</TableHead>
                <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-xs">#{sale.id.substring(0, 8)}</TableCell>
                  <TableCell>{format(new Date(sale.saleDate), "PPp")}</TableCell>
                  <TableCell>{sale.customer?.name || t('history.walkInCustomer')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(sale.paymentType)}>{sale.paymentType}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(sale)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {user?.role === 'ADMIN' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(sale)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Sale
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-12">{t('history.noSales')}</p>
          )}
          {isLoading && (
             <p className="text-center text-muted-foreground py-12">{t('inventory.saving')}</p>
          )}
        </CardContent>
      </Card>
      
      <SaleDetailDialog 
          sale={selectedSale}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
      />

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this sale?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete sale #{saleToDelete?.id.substring(0,8)}. This action will restore product stock levels and reverse any customer balance changes. This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? t('inventory.saving') : t('inventory.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
