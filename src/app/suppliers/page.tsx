
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSuppliers } from "./actions";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { Supplier } from "@prisma/client";

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchSuppliers = async () => {
        setLoading(true);
        const { suppliers: fetchedSuppliers, error: fetchError } = await getSuppliers(user.uid);
        if (fetchError) {
          setError(fetchError);
        } else {
          setSuppliers(fetchedSuppliers || []);
        }
        setLoading(false);
      };
      fetchSuppliers();
    }
  }, [user]);

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Loading suppliers...</div>
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

  return (
    <AuthGuard>
      <MainLayout>
        <SuppliersPageClient initialSuppliers={suppliers} />
      </MainLayout>
    </AuthGuard>
  );
}
