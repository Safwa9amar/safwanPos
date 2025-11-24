
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";
import { getProducts } from "@/app/inventory/actions";

export default async function PosPage() {
  const { products, error } = await getProducts();

  if (error) {
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
        <PosPageClient initialProducts={products || []} />
      </MainLayout>
    </AuthGuard>
  );
}
