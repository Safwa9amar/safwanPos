
"use client";

import { useAuth } from "@/context/auth-context";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { Separator } from "../ui/separator";

export function ProfilePageClient() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
          <CardDescription>{t("profile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <h3 className="text-lg font-medium mb-4">{t('profile.updateInfo')}</h3>
                <ProfileForm user={user} />
            </div>
            <Separator />
             <div>
                <h3 className="text-lg font-medium mb-4">{t('profile.changePassword')}</h3>
                <ChangePasswordForm user={user} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
