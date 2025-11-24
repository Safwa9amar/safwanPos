import { AuthGuard } from "@/components/auth-guard";
import { CategoriesPageClient } from "@/components/inventory/categories-page-client";
import { MainLayout } from "@/components/main-layout";
import { getCategories } from "../actions";

export default async function CategoriesPage() {
  const { categories, error } = await getCategories();

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
