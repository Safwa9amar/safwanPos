
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomers } from "./actions";
import { CustomersPageClient } from "@/components/customers/customers-page-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";

export default async function CustomersPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const { customers, totalDebt, error } = await getCustomers(userId);

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
        <CustomersPageClient initialCustomers={customers || []} totalDebt={totalDebt || 0} />
      </MainLayout>
    </AuthGuard>
  );
}
