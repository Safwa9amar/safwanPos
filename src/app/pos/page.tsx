

import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";
import { getProducts, getCategories } from "@/app/inventory/actions";
import { getCustomers } from "@/app/customers/actions";

export default async function PosPage() {
  const { products, error: productsError } = await getProducts();
  const { categories, error: categoriesError } = await getCategories();
  const { customers, error: customersError } = await getCustomers();
  
  const error = productsError || categoriesError || customersError;

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading data for POS.</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <PosPageClient 
            initialProducts={products || []} 
            categories={categories || []} 
            customers={customers || []}
        />
      </MainLayout>
    </AuthGuard>
  );
}
