
import { AuthGuard } from "@/components/auth-guard";
import { CategoriesPageClient } from "@/components/inventory/categories-page-client";
import { MainLayout } from "@/components/main-layout";
import { getCategories } from "../actions";
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


export default async function CategoriesPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect('/login');
  }

  const { categories, error } = await getCategories(userId);

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error loading categories.</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <CategoriesPageClient initialCategories={categories || []} />
      </MainLayout>
    </AuthGuard>
  );
}
