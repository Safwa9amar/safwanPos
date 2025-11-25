
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomers } from "./actions";
import { CustomersPageClient } from "@/components/customers/customers-page-client";

export default async function CustomersPage() {
  const { customers, error } = await getCustomers();

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
        <CustomersPageClient initialCustomers={customers || []} />
      </MainLayout>
    </AuthGuard>
  );
}
