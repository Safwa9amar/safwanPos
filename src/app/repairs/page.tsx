import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getRepairJobs } from "./actions";
import { RepairsPageClient } from "@/components/repairs/repairs-page-client";

export default async function RepairsPage() {
  const { jobs, error } = await getRepairJobs();

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
        <RepairsPageClient initialJobs={jobs || []} />
      </MainLayout>
    </AuthGuard>
  );
}
