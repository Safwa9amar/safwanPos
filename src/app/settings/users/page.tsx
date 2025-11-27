import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { UsersPageClient } from "@/components/settings/users-page-client";
import { getUsers } from "./actions";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      redirect('/login');
    }

    const { users, error } = await getUsers(userId);

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
                <UsersPageClient initialUsers={users || []} />
            </MainLayout>
        </AuthGuard>
    );
}
