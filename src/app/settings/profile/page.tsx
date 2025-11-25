import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { ProfilePageClient } from "@/components/settings/profile-page-client";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ProfilePageClient />
      </MainLayout>
    </AuthGuard>
  );
}
