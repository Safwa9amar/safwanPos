
"use client";

import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomerById } from "../actions";
import { CustomerDetailPageClient } from "@/components/customers/customer-detail-page-client";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { CustomerWithDetails } from "@/types";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchCustomer = async () => {
        setLoading(true);
        const { customer: fetchedCustomer, error: fetchError } = await getCustomerById(params.id, user.uid);
        if (fetchError) {
          setError(fetchError);
        }
        setCustomer(fetchedCustomer || null);
        setLoading(false);
      };
      fetchCustomer();
    }
  }, [user, params.id]);

  return (
    <AuthGuard>
      <MainLayout>
        {loading ? (
            <div className="p-4">Loading customer details...</div>
        ) : error ? (
            <div className="p-4">Error: {error}</div>
        ) : !customer ? (
            <div className="p-4">Customer not found.</div>
        ) : (
            <CustomerDetailPageClient initialCustomer={customer} />
        )}
      </MainLayout>
    </AuthGuard>
  );
}
