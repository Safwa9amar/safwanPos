import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { ProductDiscoveryClient } from "@/components/product-discovery/product-discovery-client";
import { getCategories } from "@/app/inventory/actions";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";

export default async function ProductDiscoveryPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const { categories, error } = await getCategories(userId);

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading categories: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <ProductDiscoveryClient categories={categories || []} />
      </MainLayout>
    </AuthGuard>
  );
}
