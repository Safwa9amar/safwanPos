
"use client";

import { useRef } from "react";
import { Product } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Barcode from "react-barcode";
import { useCurrency } from "@/hooks/use-currency";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";

interface BarcodeLabelDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

function BarcodeLabel({ product }: { product: Product }) {
  const { formatCurrency } = useCurrency();
  if (!product) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg">
      <p className="text-lg font-bold text-center">{product.name}</p>
      <p className="text-2xl font-black my-2">{formatCurrency(product.price)}</p>
      <Barcode value={product.barcode} width={2} height={50} fontSize={16} />
    </div>
  );
}

export function BarcodeLabelDialog({ product, onOpenChange }: BarcodeLabelDialogProps) {
  const { t } = useTranslation();
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => labelRef.current,
    pageStyle: `@page { size: auto; margin: 5mm; } @media print { body { -webkit-print-color-adjust: exact; } }`,
  });

  const isOpen = !!product;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs printable-area">
        <DialogHeader>
          <DialogTitle>{t("inventory.printBarcode")}</DialogTitle>
        </DialogHeader>
        <div ref={labelRef}>
          {product && <BarcodeLabel product={product} />}
        </div>
        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("history.close")}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {t("receipt.printButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
