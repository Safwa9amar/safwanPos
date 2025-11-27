
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { BillingPageClient } from "./billing-page-client";

export default function BillingPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <BillingPageClient />
      </MainLayout>
    </AuthGuard>
  );
}
