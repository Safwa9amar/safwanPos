"use client";

import { useState } from "react";
import { Supplier } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SupplierSheet } from "./supplier-sheet";
import { SupplierTable } from "./supplier-table";
import { useRouter } from "next/navigation";

interface SuppliersPageClientProps {
  initialSuppliers: Supplier[];
}

export function SuppliersPageClient({ initialSuppliers }: SuppliersPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsSheetOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setEditingSupplier(null);
    setIsSheetOpen(false);
  }

  const handleViewSupplier = (supplierId: string) => {
    router.push(`/suppliers/${supplierId}`);
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("suppliers.title")}</CardTitle>
            <CardDescription>{t("suppliers.description")}</CardDescription>
          </div>
          <Button onClick={handleAddSupplier}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("suppliers.add")}
          </Button>
        </CardHeader>
        <CardContent>
          <SupplierTable 
            suppliers={initialSuppliers}
            onEdit={handleEditSupplier}
            onView={handleViewSupplier}
          />
        </CardContent>
      </Card>
      
      <SupplierSheet 
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        supplier={editingSupplier}
      />
    </div>
  );
}
