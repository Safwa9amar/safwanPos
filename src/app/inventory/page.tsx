import { AuthGuard } from "@/components/auth-guard";
import { InventoryPageClient } from "@/components/inventory/inventory-page-client";
import { MainLayout } from "@/components/main-layout";
import { getProducts } from "./actions";

export default async function InventoryPage() {
  const { products, error } = await getProducts();

  if (error) {
    // Handle error case, maybe show an error message
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading products.</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <InventoryPageClient initialProducts={products || []} />
      </MainLayout>
    </AuthGuard>
  );
}
