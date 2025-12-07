
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CapitalEntry, IncomeCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertIncomeEntry } from "@/app/income/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "@/context/auth-context";


const IncomeSchema = z.object({
  id: z.string().optional(),
  details: z.string().min(1, "Details are required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  entryDate: z.coerce.date(),
  categoryId: z.string().min(1, "Category is required"),
});

type IncomeFormValues = z.infer<typeof IncomeSchema>;

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString().split('T')[0];
};

export function IncomeForm({ entry, categories, onFinished }: { entry: CapitalEntry | null, categories: IncomeCategory[], onFinished: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(IncomeSchema),
    defaultValues: {
      id: entry?.id,
      details: entry?.details || "",
      amount: entry?.amount || undefined,
      entryDate: entry ? new Date(entry.entryDate) : new Date(),
      categoryId: entry?.categoryId || "",
    },
  });

  const { formState, register, handleSubmit, setValue, watch } = form;

  const onSubmit = async (data: IncomeFormValues) => {
    if (!user) return toast({ variant: 'destructive', title: 'Authentication Error' });
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    const result = await upsertIncomeEntry(formData);

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
      {entry && <input type="hidden" {...register("id")} />}
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
      
      <div className="space-y-2">
        <Label htmlFor="categoryId">{t('income.category')}</Label>
        <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value)}>
            <SelectTrigger id="categoryId">
                <SelectValue placeholder={t('income.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="none" disabled>{t('income.noCategories')}</SelectItem>
                ) : (
                  categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))
                )}
            </SelectContent>
        </Select>
        {formState.errors.categoryId && <p className="text-sm text-destructive">{formState.errors.categoryId.message}</p>}
      </div>

       <div className="space-y-2">
        <Label htmlFor="entryDate">{t('income.date')}</Label>
         <Input
            id="entryDate"
            type="date"
            defaultValue={formatDateForInput(watch('entryDate'))}
            onChange={(e) => setValue('entryDate', e.target.valueAsDate || new Date())}
          />
        {formState.errors.entryDate && <p className="text-sm text-destructive">{formState.errors.entryDate.message}</p>}
      </div>


      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
