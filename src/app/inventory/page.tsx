
import { AuthGuard } from "@/components/auth-guard";
import { InventoryPageClient } from "@/components/inventory/inventory-page-client";
import { MainLayout } from "@/components/main-layout";
import { getProducts, getCategories } from "./actions";
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

export default async function InventoryPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect('/login');
  }

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(userId),
    getCategories(userId),
  ]);

  const error = productsResult.error || categoriesResult.error;

  if (error) {
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
        <InventoryPageClient 
          initialProducts={productsResult.products || []} 
          categories={categoriesResult.categories || []} 
        />
      </MainLayout>
    </AuthGuard>
  );
}
