
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Expense, ExpenseCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertExpense } from "@/app/expenses/actions";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const ExpenseSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  expenseDate: z.date(),
  categoryId: z.string().min(1, "Category is required"),
});

type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

export function ExpenseForm({ expense, categories, onFinished }: { expense: Expense | null, categories: ExpenseCategory[], onFinished: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      id: expense?.id,
      description: expense?.description || "",
      amount: expense?.amount || undefined,
      expenseDate: expense ? new Date(expense.expenseDate) : new Date(),
      categoryId: expense?.categoryId || "",
    },
  });

  const { formState, register, handleSubmit, setValue, watch } = form;

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!user) return toast({ variant: 'destructive', title: 'Authentication Error' });

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });
    formData.append('userId', user.uid);

    const result = await upsertExpense(formData);

    if (result.success) {
      toast({ title: t('expenses.saveSuccess') });
      onFinished();
    } else if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        if (messages) {
          form.setError(field as keyof ExpenseFormValues, { type: 'manual', message: messages[0] });
        }
      });
    } else {
      toast({
        variant: "destructive",
        title: t('expenses.saveFailed'),
        description: result.error || t('errors.unknown'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {expense && <input type="hidden" {...register("id")} />}
      
      <div className="space-y-2">
        <Label htmlFor="description">{t("expenses.descriptionLabel")}</Label>
        <Input id="description" {...register("description")} />
        {formState.errors.description && <p className="text-sm text-destructive">{formState.errors.description.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">{t("expenses.amount")}</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} />
        {formState.errors.amount && <p className="text-sm text-destructive">{formState.errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">{t('expenses.category')}</Label>
        <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value)}>
            <SelectTrigger id="categoryId">
                <SelectValue placeholder={t('expenses.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="none" disabled>{t('expenses.noCategories')}</SelectItem>
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
        <Label htmlFor="expenseDate">{t('expenses.date')}</Label>
         <Popover>
            <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                className={cn(
                "w-full justify-start text-left font-normal",
                !watch('expenseDate') && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch('expenseDate') ? format(watch('expenseDate'), "PPP") : <span>{t('history.pickDate')}</span>}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
            <Calendar
                mode="single"
                selected={watch('expenseDate')}
                onSelect={(date) => setValue('expenseDate', date || new Date())}
                initialFocus
            />
            </PopoverContent>
        </Popover>
        {formState.errors.expenseDate && <p className="text-sm text-destructive">{formState.errors.expenseDate.message}</p>}
      </div>

      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("inventory.save")}
      </Button>
    </form>
  );
}
