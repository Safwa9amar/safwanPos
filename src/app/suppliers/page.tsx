
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSuppliers } from "./actions";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";


export default async function SuppliersPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const { suppliers, error } = await getSuppliers(userId);

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
