
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertCustomer } from "@/app/customers/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/context/auth-context";

const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof CustomerSchema>;

export function CustomerForm({ customer, onFinished }: { customer: Customer | null, onFinished: () => void }) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: customer || {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const { formState, register, handleSubmit } = form;

  const onSubmit = async (data: CustomerFormValues) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error" });
        return;
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("userId", user.uid);

    const result = await upsertCustomer(formData);

    if (result.success) {
      toast({
        title: customer ? t('customers.updateSuccessTitle') : t('customers.createSuccessTitle'),
        description: t('customers.saveSuccessDescription', { name: data.name }),
      });
      onFinished();
    } else if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        if (messages) {
          form.setError(field as keyof CustomerFormValues, { type: 'manual', message: messages[0] });
        }
      });
    } else {
      toast({
        variant: "destructive",
        title: t('customers.saveFailedTitle'),
        description: result.message || t('errors.unknown'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {customer && <input type="hidden" {...register("id")} />}
      <div className="space-y-2">
        <Label htmlFor="name">{t("customers.name")}</Label>
        <Input id="name" {...register("name")} />
        {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("customers.phone")}</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {formState.errors.phone && <p className="text-sm text-destructive">{formState.errors.phone.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("customers.email")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {formState.errors.email && <p className="text-sm text-destructive">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{t("customers.address")}</Label>
        <Textarea id="address" {...register("address")} />
        {formState.errors.address && <p className="text-sm text-destructive">{formState.errors.address.message}</p>}
      </div>
      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
