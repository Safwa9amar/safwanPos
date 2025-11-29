
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
import { Input } from "../ui/input";

interface SuppliersPageClientProps {
  initialSuppliers: Supplier[];
}

export function SuppliersPageClient({ initialSuppliers }: SuppliersPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    router.refresh();
  }

  const handleViewSupplier = (supplierId: string) => {
    router.push(`/suppliers/${supplierId}`);
  };

  const filteredSuppliers = initialSuppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>{t("suppliers.title")}</CardTitle>
            <CardDescription>{t("suppliers.description")}</CardDescription>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Input 
              placeholder="Search suppliers..."
              className="flex-1 md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleAddSupplier} className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("suppliers.add")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SupplierTable 
            suppliers={filteredSuppliers}
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
