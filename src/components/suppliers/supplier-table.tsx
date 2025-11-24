"use client";

import { useState } from "react";
import { Supplier } from "@prisma/client";
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
import { deleteSupplier } from "@/app/suppliers/actions";
import { DeleteProductAlert } from "../inventory/delete-product-alert";

interface SupplierTableProps {
    suppliers: Supplier[], 
    onEdit: (supplier: Supplier) => void;
    onView: (supplierId: string) => void;
}

export function SupplierTable({ suppliers, onEdit, onView }: SupplierTableProps) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;

    setIsDeleting(true);
    const result = await deleteSupplier(selectedSupplier.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: "Supplier Deleted",
        description: `${selectedSupplier.name} has been removed.`,
      });
      setIsAlertOpen(false);
      setSelectedSupplier(null);
    } else {
      toast({
        variant: "destructive",
        title: t("suppliers.deleteFailed"),
        description: result.error || t("suppliers.deleteFailedDescription"),
      });
      setIsAlertOpen(false);
    }
  };

  if (suppliers.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("suppliers.noSuppliers")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("suppliers.name")}</TableHead>
            <TableHead>{t("suppliers.contactName")}</TableHead>
            <TableHead>{t("suppliers.email")}</TableHead>
            <TableHead>{t("suppliers.phone")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.contactName || 'N/A'}</TableCell>
              <TableCell>{supplier.email || 'N/A'}</TableCell>
              <TableCell>{supplier.phone || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(supplier.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(supplier)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
