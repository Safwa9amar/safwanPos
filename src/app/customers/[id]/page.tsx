
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomerById } from "../actions";
import { CustomerDetailPageClient } from "@/components/customers/customer-detail-page-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";


export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest();
  
  if (!userId) {
    redirect('/login');
  }

  const { customer, error } = await getCustomerById(params.id, userId);

  return (
    <AuthGuard>
      <MainLayout>
        {error ? (
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
