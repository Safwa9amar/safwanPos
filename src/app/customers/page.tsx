
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomers } from "./actions";
import { CustomersPageClient } from "@/components/customers/customers-page-client";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { Customer } from "@prisma/client";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchCustomers = async () => {
        setLoading(true);
        const { customers: fetchedCustomers, totalDebt: fetchedTotalDebt, error: fetchError } = await getCustomers(user.uid);
        if (fetchError) {
          setError(fetchError);
        } else {
          setCustomers(fetchedCustomers || []);
          setTotalDebt(fetchedTotalDebt || 0);
        }
        setLoading(false);
      };
      fetchCustomers();
    }
  }, [user]);

  if (loading) {
    return (
        <AuthGuard>
            <MainLayout>
                <div className="p-4">Loading customers...</div>
            </MainLayout>
        </AuthGuard>
    )
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
        <CustomersPageClient initialCustomers={customers} totalDebt={totalDebt} />
      </MainLayout>
    </AuthGuard>
  );
}
