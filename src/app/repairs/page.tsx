
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getRepairJobs } from "./actions";
import { RepairsPageClient } from "@/components/repairs/repairs-page-client";
import { redirect } from "next/navigation";
import { getUserIdFromRequest } from "@/lib/server-auth";


export default async function RepairsPage() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    redirect('/login');
  }

  const { jobs, error } = await getRepairJobs(userId);

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
