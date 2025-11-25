
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";
import { getProducts, getCategories } from "@/app/inventory/actions";
import { getCustomers } from "@/app/customers/actions";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";

export default async function PosPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }
  
  const [productsRes, categoriesRes, customersRes] = await Promise.all([
    getProducts(userId),
    getCategories(userId),
    getCustomers(userId),
  ]);
  
  const error = productsRes.error || categoriesRes.error || customersRes.error;
  
  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading data for POS: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <PosPageClient 
            initialProducts={productsRes.products || []} 
            categories={categoriesRes.categories || []} 
            customers={customersRes.customers || []}
        />
      </MainLayout>
    </AuthGuard>
  );
}
