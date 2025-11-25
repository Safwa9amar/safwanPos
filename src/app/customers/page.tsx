
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomers } from "./actions";
import { CustomersPageClient } from "@/components/customers/customers-page-client";
import { getAdminAuth } from "@/lib/firebase-admin";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getUserId() {
    const auth = getAdminAuth();
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return null;
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return null;
    }
}

export default async function CustomersPage() {
  const userId = await getUserId();
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
