
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSupplierById } from "../actions";
import { SupplierDetailPageClient } from "@/components/suppliers/supplier-detail-page-client";
import { getProducts } from "@/app/inventory/actions";
import { getAdminAuth } from "@/lib/firebase-admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getUserId() {
    const auth = getAdminAuth();
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return null;
    }
}

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const userId = await getUserId();
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
        <SupplierDetailPageClient initialSupplier={supplierRes.supplier} allProducts={productsRes.products || []} />
      </MainLayout>
    </AuthGuard>
  );
}
