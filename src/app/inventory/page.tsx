
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { InventoryPageClient } from "@/components/inventory/inventory-page-client";
import { MainLayout } from "@/components/main-layout";
import { getProducts, getCategories } from "./actions";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { ProductWithCategory, Category } from "@/types";

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const [productsResult, categoriesResult] = await Promise.all([
          getProducts(user.uid),
          getCategories(user.uid),
        ]);

        if (productsResult.error || categoriesResult.error) {
          setError(productsResult.error || categoriesResult.error || "Failed to load data");
        } else {
          setProducts(productsResult.products || []);
          setCategories(categoriesResult.categories || []);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);


  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Loading inventory...</div>
        </MainLayout>
      </AuthGuard>
    );
  }

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
        <InventoryPageClient initialProducts={products} categories={categories} />
      </MainLayout>
    </AuthGuard>
  );
}
