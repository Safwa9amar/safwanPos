
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/use-translation";

interface DeleteProductAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  itemCount?: number;
}

export function DeleteProductAlert({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
  itemCount = 1,
}: DeleteProductAlertProps) {
  const { t } = useTranslation("translation");
  
  const title = itemCount > 1 
    ? `Delete ${itemCount} products?` 
    : t("inventory.deleteConfirmTitle");
  
  const description = itemCount > 1
    ? `This will permanently delete the ${itemCount} selected products. This action cannot be undone.`
    : t("inventory.deleteConfirmDescription");

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("pos.cancelButton")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? t("inventory.saving") : t("inventory.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
