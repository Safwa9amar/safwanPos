
import { AuthGuard } from "@/components/auth-guard";
import { InventoryPageClient } from "@/components/inventory/inventory-page-client";
import { MainLayout } from "@/components/main-layout";
import { getProducts, getCategories } from "./actions";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { ProductWithCategoryAndBarcodes } from "@/types";

export default async function InventoryPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(userId),
    getCategories(userId),
  ]);

  const error = productsResult.error || categoriesResult.error;

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading data: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <InventoryPageClient 
          initialProducts={productsResult.products as ProductWithCategoryAndBarcodes[] || []} 
          categories={categoriesResult.categories || []} 
        />
      </MainLayout>
    </AuthGuard>
  );
}
