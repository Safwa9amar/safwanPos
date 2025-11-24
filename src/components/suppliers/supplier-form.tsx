"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Supplier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertSupplier } from "@/app/suppliers/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";

const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof SupplierSchema>;

export function SupplierForm({ supplier, onFinished }: { supplier: Supplier | null, onFinished: () => void }) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: supplier || {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const { formState } = form;

  const onSubmit = async (data: SupplierFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const result = await upsertSupplier(formData);

    if (result.success) {
      toast({
        title: supplier ? "Supplier Updated" : "Supplier Added",
        description: `${data.name} has been saved.`,
      });
      onFinished();
    } else if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        if (messages) {
          form.setError(field as keyof SupplierFormValues, { type: 'manual', message: messages[0] });
        }
      });
    } else {
      toast({
        variant: "destructive",
        title: `Error saving supplier`,
        description: result.message || "An unknown error occurred.",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {supplier && <input type="hidden" {...form.register("id")} />}
      <div className="space-y-2">
        <Label htmlFor="name">{t("suppliers.name")}</Label>
        <Input id="name" {...form.register("name")} />
        {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactName">{t("suppliers.contactName")}</Label>
        <Input id="contactName" {...form.register("contactName")} />
        {formState.errors.contactName && <p className="text-sm text-destructive">{formState.errors.contactName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("suppliers.email")}</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {formState.errors.email && <p className="text-sm text-destructive">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("suppliers.phone")}</Label>
        <Input id="phone" type="tel" {...form.register("phone")} />
        {formState.errors.phone && <p className="text-sm text-destructive">{formState.errors.phone.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">{t("suppliers.address")}</Label>
        <Textarea id="address" {...form.register("address")} />
        {formState.errors.address && <p className="text-sm text-destructive">{formState.errors.address.message}</p>}
      </div>
      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
