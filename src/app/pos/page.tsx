import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { PosPageClient } from "@/components/pos/pos-page-client";

export default function PosPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <PosPageClient />
      </MainLayout>
    </AuthGuard>
  );
}
