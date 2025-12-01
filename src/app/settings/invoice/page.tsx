import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/main-layout";
import { InvoiceSettingsClient } from "@/components/settings/invoice/invoice-settings-client";
import { getCompanyProfile, upsertCompanyProfile } from "@/app/settings/invoice/actions";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export default async function InvoiceSettingsPage() {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        redirect('/login');
    }

    const { profile, error } = await getCompanyProfile(userId);

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
                <InvoiceSettingsClient initialProfile={profile} />
            </MainLayout>
        </AuthGuard>
    );
}
