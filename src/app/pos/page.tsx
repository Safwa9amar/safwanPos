
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";
import { getProducts, getCategories } from "@/app/inventory/actions";
import { getCustomers } from "@/app/customers/actions";
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

export default async function PosPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect('/login');
  }
  
  const [productsRes, categoriesRes, customersRes] = await Promise.all([
    getProducts(userId),
    getCategories(userId),
    getCustomers(userId),
  ]);
  
  const error = productsRes.error || categoriesRes.error || customersRes.error;
  
  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading data for POS: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <PosPageClient 
            initialProducts={productsRes.products || []} 
            categories={categoriesRes.categories || []} 
            customers={customersRes.customers || []}
        />
      </MainLayout>
    </AuthGuard>
  );
}
