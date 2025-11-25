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
import { changePassword } from "@/app/settings/actions";

const PasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
});


type PasswordFormValues = z.infer<typeof PasswordSchema>;

export function ChangePasswordForm({ user }: { user: User }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
        newPassword: "",
        confirmNewPassword: "",
    },
  });

  const { formState, register, handleSubmit, reset } = form;

  const onSubmit = async (data: PasswordFormValues) => {
    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("newPassword", data.newPassword);
    
    const result = await changePassword(formData);

    if (result.success) {
      toast({
        title: t('profile.passwordUpdateSuccess'),
      });
      reset();
    } else {
      toast({
        variant: "destructive",
        title: t('profile.passwordUpdateFailed'),
        description: result.error,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
        <Input id="newPassword" type="password" {...register("newPassword")} />
        {formState.errors.newPassword && <p className="text-sm text-destructive">{formState.errors.newPassword.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">{t("profile.confirmNewPassword")}</Label>
        <Input id="confirmNewPassword" type="password" {...register("confirmNewPassword")} />
        {formState.errors.confirmNewPassword && <p className="text-sm text-destructive">{formState.errors.confirmNewPassword.message}</p>}
      </div>
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("profile.changePassword")}
      </Button>
    </form>
  );
}
