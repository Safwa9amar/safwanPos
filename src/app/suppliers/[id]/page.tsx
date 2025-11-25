
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSupplierById } from "../actions";
import { SupplierDetailPageClient } from "@/components/suppliers/supplier-detail-page-client";
import { getProducts } from "@/app/inventory/actions";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Product } from "@prisma/client";

interface SupplierWithOrders extends import("@prisma/client").Supplier {
    purchaseOrders: import("@prisma/client").PurchaseOrder[];
}

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierWithOrders | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        const [supplierRes, productsRes] = await Promise.all([
          getSupplierById(params.id, user.uid),
          getProducts(user.uid)
        ]);

        if (supplierRes.error || productsRes.error) {
          setError(supplierRes.error || productsRes.error || "Failed to load data");
        } else {
          setSupplier(supplierRes.supplier || null);
          setProducts(productsRes.products || []);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [user, params.id]);

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Loading supplier details...</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (!supplier) {
    return (
        <AuthGuard>
          <MainLayout>
            <div className="p-4">Supplier not found.</div>
          </MainLayout>
        </AuthGuard>
      );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <SupplierDetailPageClient initialSupplier={supplier} allProducts={products} />
      </MainLayout>
    </AuthGuard>
  );
}
