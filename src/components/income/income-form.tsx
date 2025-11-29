
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addCapitalEntry } from "@/app/income/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";

const IncomeSchema = z.object({
  details: z.string().min(1, "Details are required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
});

type IncomeFormValues = z.infer<typeof IncomeSchema>;

export function IncomeForm({ onFinished }: { onFinished: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(IncomeSchema),
    defaultValues: {
      details: "",
      amount: undefined,
    },
  });

  const { formState, register, handleSubmit } = form;

  const onSubmit = async (data: IncomeFormValues) => {
    const formData = new FormData();
    formData.append("details", data.details);
    formData.append("amount", data.amount.toString());

    const result = await addCapitalEntry(formData);

    if (result.success) {
      toast({ title: t('income.saveSuccess') });
      onFinished();
    } else if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        if (messages) {
          form.setError(field as keyof IncomeFormValues, { type: 'manual', message: messages[0] });
        }
      });
    } else {
      toast({
        variant: "destructive",
        title: t('income.saveFailed'),
        description: result.error || t('errors.unknown'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="details">{t("income.details")}</Label>
        <Textarea id="details" {...register("details")} placeholder="e.g., Initial capital, loan from family" />
        {formState.errors.details && <p className="text-sm text-destructive">{formState.errors.details.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">{t("income.amount")}</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} />
        {formState.errors.amount && <p className="text-sm text-destructive">{formState.errors.amount.message}</p>}
      </div>

      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
