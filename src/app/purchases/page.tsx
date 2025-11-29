
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getProducts } from "@/app/inventory/actions";
import { getDirectPurchases } from "./actions";
import { PurchasesPageClient } from "@/components/purchases/purchases-page-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { ProductWithCategoryAndBarcodes } from "@/types";

export default async function PurchasesPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const [purchasesRes, productsRes] = await Promise.all([
    getDirectPurchases(userId),
    getProducts(userId)
  ]);
  
  const error = purchasesRes.error || productsRes.error;
  
  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <PurchasesPageClient 
            initialPurchases={purchasesRes.purchases || []}
            allProducts={productsRes.products as ProductWithCategoryAndBarcodes[] || []}
        />
      </MainLayout>
    </AuthGuard>
  );
}
