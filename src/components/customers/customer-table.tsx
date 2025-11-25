
"use client";

import { useState } from "react";
import { Customer } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { deleteCustomer } from "@/app/customers/actions";
import { DeleteProductAlert } from "../inventory/delete-product-alert";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
    customers: Customer[], 
    onEdit: (customer: Customer) => void;
    onView: (customerId: string) => void;
}

export function CustomerTable({ customers, onEdit, onView }: CustomerTableProps) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    setIsDeleting(true);
    const result = await deleteCustomer(selectedCustomer.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: t('customers.deleteSuccessTitle'),
        description: t('customers.deleteSuccessDescription', { name: selectedCustomer.name }),
      });
      setIsAlertOpen(false);
      setSelectedCustomer(null);
    } else {
      toast({
        variant: "destructive",
        title: t('customers.deleteFailedTitle'),
        description: result.error || t('customers.deleteFailedDescription'),
      });
      setIsAlertOpen(false);
    }
  };

  if (customers.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("customers.noCustomers")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("customers.name")}</TableHead>
            <TableHead>{t("customers.phone")}</TableHead>
            <TableHead>{t("customers.email")}</TableHead>
            <TableHead className="text-right">{t("customers.balance")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.phone || 'N/A'}</TableCell>
              <TableCell>{customer.email || 'N/A'}</TableCell>
              <TableCell className={cn(
                  "text-right font-semibold",
                  customer.balance > 0 ? "text-destructive" : "text-green-600"
              )}>
                {formatCurrency(customer.balance)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(customer.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("inventory.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteProductAlert
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
