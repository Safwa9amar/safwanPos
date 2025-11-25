
import { AuthGuard } from "@/components/auth-guard";
import { CategoriesPageClient } from "@/components/inventory/categories-page-client";
import { MainLayout } from "@/components/main-layout";
import { getCategories } from "../actions";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";


export default async function CategoriesPage() {
  const userId = await getUserIdFromRequest();
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
