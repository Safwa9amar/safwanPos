
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getCustomerById } from "../actions";
import { CustomerDetailPageClient } from "@/components/customers/customer-detail-page-client";
import { headers } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
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


export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const userId = await getUserId();
  
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
