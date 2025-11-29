
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
import { Eye, MoreHorizontal, Pencil, Trash2, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { deleteSupplier } from "@/app/suppliers/actions";
import { DeleteProductAlert } from "../inventory/delete-product-alert";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { Badge } from "../ui/badge";

interface SupplierTableProps {
    suppliers: Supplier[], 
    onEdit: (supplier: Supplier) => void;
    onView: (supplierId: string) => void;
}

export function SupplierTable({ suppliers, onEdit, onView }: SupplierTableProps) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier || !user) return;

    setIsDeleting(true);
    const result = await deleteSupplier(selectedSupplier.id, user.id);
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
            <TableHead className="w-24">Logo</TableHead>
            <TableHead>{t("suppliers.name")}</TableHead>
            <TableHead>{t("suppliers.contactName")}</TableHead>
            <TableHead>{t("suppliers.phone")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id} className="cursor-pointer" onClick={() => onView(supplier.id)}>
               <TableCell>
                 <div className="relative h-10 w-10">
                    {supplier.logoUrl ? (
                        <Image src={supplier.logoUrl} alt={supplier.name} fill className="rounded-md object-contain bg-muted" />
                    ) : (
                         <div className="h-full w-full bg-muted rounded-md flex items-center justify-center">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                 </div>
              </TableCell>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.contactName || 'N/A'}</TableCell>
              <TableCell>{supplier.phone || 'N/A'}</TableCell>
              <TableCell>
                  <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {supplier.status}
                  </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(supplier.id)}}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(supplier)}}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteClick(supplier)}} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
