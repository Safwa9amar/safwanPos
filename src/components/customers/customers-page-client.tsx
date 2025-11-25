
"use client";

import { useState } from "react";
import { Customer } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { CustomerSheet } from "./customer-sheet";
import { CustomerTable } from "./customer-table";
import { useRouter } from "next/navigation";

interface CustomersPageClientProps {
  initialCustomers: Customer[];
}

export function CustomersPageClient({ initialCustomers }: CustomersPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsSheetOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsSheetOpen(true);
  };
  
  const onSheetClose = () => {
    setEditingCustomer(null);
    setIsSheetOpen(false);
  }

  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("customers.title")}</CardTitle>
            <CardDescription>{t("customers.description")}</CardDescription>
          </div>
          <Button onClick={handleAddCustomer}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("customers.add")}
          </Button>
        </CardHeader>
        <CardContent>
          <CustomerTable 
            customers={initialCustomers}
            onEdit={handleEditCustomer}
            onView={handleViewCustomer}
          />
        </CardContent>
      </Card>
      
      <CustomerSheet 
        isOpen={isSheetOpen}
        onOpenChange={onSheetClose}
        customer={editingCustomer}
      />
    </div>
  );
}
