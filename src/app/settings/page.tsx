import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { SettingsPageClient } from "@/components/settings/settings-page-client";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <SettingsPageClient />
      </MainLayout>
    </AuthGuard>
  );
}
