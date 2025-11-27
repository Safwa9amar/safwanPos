
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { HomePageClient } from "@/components/home/home-page-client";

export default function HomePage() {
  return (
    <AuthGuard>
      <MainLayout>
        <HomePageClient />
      </MainLayout>
    </AuthGuard>
  );
}
