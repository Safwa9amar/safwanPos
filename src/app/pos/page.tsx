
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";
import { getProducts, getCategories } from "@/app/inventory/actions";
import { getCustomers } from "@/app/customers/actions";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Category, Customer } from "@prisma/client";
import { ProductWithCategory } from "@/types";

export default function PosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const [productsRes, categoriesRes, customersRes] = await Promise.all([
          getProducts(user.uid),
          getCategories(user.uid),
          getCustomers(user.uid),
        ]);
        
        const fetchError = productsRes.error || categoriesRes.error || customersRes.error;
        if (fetchError) {
          setError(fetchError);
        } else {
          setProducts(productsRes.products || []);
          setCategories(categoriesRes.categories || []);
          setCustomers(customersRes.customers || []);
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
          <div className="p-4">Loading POS...</div>
        </MainLayout>
      </AuthGuard>
    );
  }
  
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
            initialProducts={products} 
            categories={categories} 
            customers={customers}
        />
      </MainLayout>
    </AuthGuard>
  );
}
