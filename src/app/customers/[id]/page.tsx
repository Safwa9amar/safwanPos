
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomerById } from "../actions";
import { CustomerDetailPageClient } from "@/components/customers/customer-detail-page-client";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { customer, error } = await getCustomerById(params.id);

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Error: {error}</div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (!customer) {
    return (
        <AuthGuard>
          <MainLayout>
            <div className="p-4">Customer not found.</div>
          </MainLayout>
        </AuthGuard>
      );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <CustomerDetailPageClient initialCustomer={customer} />
      </MainLayout>
    </AuthGuard>
  );
}
