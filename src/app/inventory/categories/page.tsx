
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { CategoriesPageClient } from "@/components/inventory/categories-page-client";
import { MainLayout } from "@/components/main-layout";
import { getCategories } from "../actions";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { Category } from "@prisma/client";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        setLoading(true);
        const { categories: fetchedCategories, error: fetchError } = await getCategories(user.uid);
        if (fetchError) {
          setError(fetchError);
        } else {
          setCategories(fetchedCategories || []);
        }
        setLoading(false);
      };
      fetchCategories();
    }
  }, [user]);

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Loading categories...</div>
        </MainLayout>
      </AuthGuard>
    );
  }

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
        <CategoriesPageClient initialCategories={categories} />
      </MainLayout>
    </AuthGuard>
  );
}
