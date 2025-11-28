
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSupplierById } from "../actions";
import { SupplierDetailPageClient } from "@/components/suppliers/supplier-detail-page-client";
import { getProducts } from "@/app/inventory/actions";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { ProductWithCategoryAndBarcodes } from "@/types";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const [supplierRes, productsRes] = await Promise.all([
    getSupplierById(params.id, userId),
    getProducts(userId)
  ]);

  const error = supplierRes.error || productsRes.error;

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (!supplierRes.supplier) {
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
        <SupplierDetailPageClient initialSupplier={supplierRes.supplier} allProducts={productsRes.products as ProductWithCategoryAndBarcodes[] || []} />
      </MainLayout>
    </AuthGuard>
  );
}

