import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSuppliers } from "./actions";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";

export default async function SuppliersPage() {
  const { suppliers, error } = await getSuppliers();

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
        <SuppliersPageClient initialSuppliers={suppliers || []} />
      </MainLayout>
    </AuthGuard>
  );
}
