import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { UsersPageClient } from "@/components/settings/users-page-client";
import { getUsers } from "./actions";

export default async function UsersPage() {
    const { users, error } = await getUsers();

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
