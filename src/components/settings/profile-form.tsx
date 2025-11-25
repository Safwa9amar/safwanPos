"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { updateProfile } from "@/app/settings/actions";

const ProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

export function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      email: user.email || "",
    },
  });

  const { formState, register, handleSubmit } = form;

  const onSubmit = async (data: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("displayName", data.displayName);
    
    const result = await updateProfile(formData);

    if (result.success) {
      toast({
        title: t('profile.updateSuccess'),
      });
      // The name in the sidebar won't update until a page reload/re-auth, which is acceptable.
    } else {
      toast({
        variant: "destructive",
        title: t('profile.updateFailed'),
        description: result.error,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("profile.displayName")}</Label>
        <Input id="displayName" {...register("displayName")} />
        {formState.errors.displayName && <p className="text-sm text-destructive">{formState.errors.displayName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("profile.email")}</Label>
        <Input id="email" type="email" value={user.email || ''} readOnly disabled />
      </div>
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
