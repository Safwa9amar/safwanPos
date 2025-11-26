
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { updateProfile } from "@/app/settings/actions";
import { User } from "@prisma/client";
import { useAuth } from "@/context/auth-context";

const ProfileSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

export function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { checkUser } = useAuth();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
  });

  const { formState, register, handleSubmit } = form;

  const onSubmit = async (data: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("uid", user.id);
    formData.append("name", data.name);
    
    const result = await updateProfile(formData);

    if (result.success) {
      toast({
        title: t('profile.updateSuccess'),
      });
      await checkUser(); // Refresh user data in context
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
        <Input id="displayName" {...register("name")} />
        {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
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
