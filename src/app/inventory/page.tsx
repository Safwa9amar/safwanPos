import { AuthGuard } from "@/components/auth-guard";
import { InventoryPageClient } from "@/components/inventory/inventory-page-client";
import { MainLayout } from "@/components/main-layout";
import { getProducts, getCategories } from "./actions";

export default async function InventoryPage() {
  const { products, error: productsError } = await getProducts();
  const { categories, error: categoriesError } = await getCategories();

  const error = productsError || categoriesError;

  if (error) {
    // Handle error case, maybe show an error message
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
        <InventoryPageClient initialProducts={products || []} categories={categories || []} />
      </MainLayout>
    </AuthGuard>
  );
}
