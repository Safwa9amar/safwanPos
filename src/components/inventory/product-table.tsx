
"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeleteProductAlert } from "./delete-product-alert";
import { deleteProduct } from "@/app/inventory/actions";
import { useToast } from "@/hooks/use-toast";
import { ProductWithCategoryAndBarcodes } from "@/types";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useCurrency } from "@/hooks/use-currency";
import { BarcodeLabelDialog } from "./barcode-label-dialog";
import { useAuth } from "@/context/auth-context";
import { format, differenceInDays } from "date-fns";

export function ProductTable({ products, onEdit, lastElementRef }: { products: ProductWithCategoryAndBarcodes[], onEdit: (product: ProductWithCategoryAndBarcodes) => void, lastElementRef?: (node: HTMLTableRowElement) => void }) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToPrint, setProductToPrint] = useState<ProductWithCategoryAndBarcodes | null>(null);

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };

  const handlePrintClick = (product: ProductWithCategoryAndBarcodes) => {
    setProductToPrint(product);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct || !user) return;

    setIsDeleting(true);
    const result = await deleteProduct(selectedProduct.id, user.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: "Product Deleted",
        description: `${selectedProduct.name} has been removed.`,
      });
      setIsAlertOpen(false);
      setSelectedProduct(null);
    } else {
      toast({
        variant: "destructive",
        title: t("inventory.deleteFailed"),
        description: result.error || t("inventory.deleteFailedDescription"),
      });
      setIsAlertOpen(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        {t("inventory.noProducts")}
      </div>
    );
  }

  const getExpiryBadge = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysUntilExpiry <= 30) {
      return <Badge variant="destructive" className="bg-yellow-500 text-white">Expires in {daysUntilExpiry} days</Badge>;
    }
    return <span>{format(new Date(expiryDate), "PP")}</span>;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>{t("inventory.productName")}</TableHead>
            <TableHead>{t("inventory.category")}</TableHead>
            <TableHead>{t("inventory.barcode")}</TableHead>
            <TableHead>تاريخ انتهاء الصلاحية</TableHead>
            <TableHead className="text-right">{t("inventory.price")}</TableHead>
            <TableHead className="text-right">{t("inventory.costPrice")}</TableHead>
            <TableHead className="text-right">{t("inventory.stock")}</TableHead>
            <TableHead className="w-[80px] text-right">{t("inventory.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.id} ref={index === products.length - 1 ? lastElementRef : null}>
              <TableCell>
                {product.image ? (
                   <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
                    No Img
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                {product.category ? (
                  <Badge variant="secondary">{product.category.name}</Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {product.barcodes.map(b => <Badge key={b.id} variant="outline">{b.code}</Badge>)}
                </div>
              </TableCell>
              <TableCell>
                {getExpiryBadge(product.expiryDate)}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
              <TableCell className="text-right">{formatCurrency(product.costPrice)}</TableCell>
              <TableCell className="text-right">{product.stock} {t(`units.${product.unit}`)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("inventory.edit")}
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handlePrintClick(product)}>
                      <Printer className="mr-2 h-4 w-4" />
                      {t("inventory.printBarcode")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
      {/* The barcode dialog expects the first barcode for printing */}
      <BarcodeLabelDialog 
        product={productToPrint ? { ...productToPrint, barcode: productToPrint.barcodes[0]?.code } : null}
        onOpenChange={(isOpen) => !isOpen && setProductToPrint(null)}
      />
    </>
  );
}
