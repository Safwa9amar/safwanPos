
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getSuppliers } from "./actions";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";
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


export default async function SuppliersPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect('/login');
  }

  const { suppliers, error } = await getSuppliers(userId);

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
        <SuppliersPageClient initialSuppliers={suppliers || []} />
      </MainLayout>
    </AuthGuard>
  );
}
