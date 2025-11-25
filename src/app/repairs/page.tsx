
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { getRepairJobs } from "./actions";
import { RepairsPageClient } from "@/components/repairs/repairs-page-client";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { RepairJob } from "@prisma/client";

export default function RepairsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchJobs = async () => {
        setLoading(true);
        const { jobs: fetchedJobs, error: fetchError } = await getRepairJobs(user.uid);
        if (fetchError) {
          setError(fetchError);
        } else {
          setJobs(fetchedJobs || []);
        }
        setLoading(false);
      };
      fetchJobs();
    }
  }, [user]);

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="p-4">Loading repairs...</div>
        </MainLayout>
      </AuthGuard>
    );
  }

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
        <RepairsPageClient initialJobs={jobs} />
      </MainLayout>
    </AuthGuard>
  );
}
