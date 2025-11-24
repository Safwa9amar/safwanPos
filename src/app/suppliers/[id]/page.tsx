import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSupplierById } from "../actions";
import { SupplierDetailPageClient } from "@/components/suppliers/supplier-detail-page-client";
import { getProducts } from "@/app/inventory/actions";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const { supplier, error } = await getSupplierById(params.id);
  const { products, error: productsError } = await getProducts();

  if (error || productsError) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error: {error || productsError}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (!supplier) {
    return (
        <AuthGuard>
          <MainLayout>
            <div className="p-4">Supplier not found.</div>
          </MainLayout>
        </AuthGuard>
      );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <SupplierDetailPageClient initialSupplier={supplier} allProducts={products || []} />
      </MainLayout>
    </AuthGuard>
  );
}
