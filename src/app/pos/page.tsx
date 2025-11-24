
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";
import { getProducts, getCategories } from "@/app/inventory/actions";

export default async function PosPage() {
  const { products, error: productsError } = await getProducts();
  const { categories, error: categoriesError } = await getCategories();
  
  const error = productsError || categoriesError;

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading products or categories.</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <PosPageClient initialProducts={products || []} categories={categories || []} />
      </MainLayout>
    </AuthGuard>
  );
}
