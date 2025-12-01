"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CompanyProfile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { upsertCompanyProfile } from "@/app/settings/invoice/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { Separator } from "@/components/ui/separator";

const ProfileSchema = z.object({
    name: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    taxId1Label: z.string().optional(),
    taxId1Value: z.string().optional(),
    taxId2Label: z.string().optional(),
    taxId2Value: z.string().optional(),
    invoiceTitle: z.string().optional(),
    invoiceFooter: z.string().optional(),
});

type FormValues = z.infer<typeof ProfileSchema>;

export function InvoiceSettingsForm({ initialProfile }: { initialProfile: CompanyProfile | null }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: initialProfile || {},
  });

  const { formState, register, handleSubmit } = form;

  const onSubmit = async (data: FormValues) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error" });
        return;
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    const result = await upsertCompanyProfile(user.id, formData);

    if (result.success) {
      toast({
        title: "Settings Saved",
        description: "Your invoice settings have been updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error Saving Settings",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Company Information</h3>
        <Separator className="my-2" />
        <div className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" {...register("name")} placeholder="Your Company LLC"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" {...register("logoUrl")} placeholder="https://example.com/logo.png" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" {...register("address")} placeholder="123 Main St, Anytown, USA 12345" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" {...register("website")} placeholder="https://yourcompany.com" />
                </div>
            </div>
        </div>
      </div>
      
       <div>
        <h3 className="text-lg font-medium">Invoice Details</h3>
        <Separator className="my-2" />
        <div className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="invoiceTitle">Invoice Title</Label>
                    <Input id="invoiceTitle" {...register("invoiceTitle")} placeholder="Invoice / Receipt" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="invoiceFooter">Footer Text / Payment Terms</Label>
                    <Textarea id="invoiceFooter" {...register("invoiceFooter")} placeholder="Thank you for your business. Payment due in 30 days."/>
                </div>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tax ID 1 Label</Label>
                    <Input {...register("taxId1Label")} placeholder="e.g., VAT, TPS" />
                </div>
                <div className="space-y-2">
                    <Label>Tax ID 1 Value</Label>
                    <Input {...register("taxId1Value")} placeholder="Enter tax number" />
                </div>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tax ID 2 Label</Label>
                    <Input {...register("taxId2Label")} placeholder="e.g., GST, TVQ" />
                </div>
                <div className="space-y-2">
                    <Label>Tax ID 2 Value</Label>
                    <Input {...register("taxId2Value")} placeholder="Enter tax number" />
                </div>
            </div>
        </div>
      </div>

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
