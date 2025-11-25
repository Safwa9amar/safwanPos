"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RepairJob } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { upsertRepairJob } from "@/app/repairs/actions";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "COLLECTED"] as const;

const RepairJobSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  deviceModel: z.string().min(1, "Device model is required"),
  imei: z.string().optional(),
  reportedProblem: z.string().min(1, "Reported problem is required"),
  notes: z.string().optional(),
  status: z.enum(statuses),
  estimatedCost: z.coerce.number().optional(),
  finalCost: z.coerce.number().optional(),
  boxNumber: z.coerce.number().optional(),
});

type RepairJobFormValues = z.infer<typeof RepairJobSchema>;

export function RepairJobForm({ job, onFinished }: { job: RepairJob | null, onFinished: () => void }) {
  const { t } = useTranslation("translation");
  const { toast } = useToast();
  const form = useForm<RepairJobFormValues>({
    resolver: zodResolver(RepairJobSchema),
    defaultValues: {
      id: job?.id,
      customerName: job?.customerName || "",
      customerPhone: job?.customerPhone || "",
      deviceModel: job?.deviceModel || "",
      imei: job?.imei || "",
      reportedProblem: job?.reportedProblem || "",
      notes: job?.notes || "",
      status: (job?.status as RepairJobFormValues['status']) || "PENDING",
      estimatedCost: job?.estimatedCost || undefined,
      finalCost: job?.finalCost || undefined,
      boxNumber: job?.boxNumber || undefined,
    },
  });

  const { formState, register, handleSubmit, setValue, watch } = form;

  const onSubmit = async (data: RepairJobFormValues) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
        if(value !== undefined && value !== null){
            formData.append(key, String(value));
        }
    });

    const result = await upsertRepairJob(formData);

    if (result.success) {
      toast({
        title: t('repairs.saveSuccess'),
      });
      onFinished();
    } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
            if(messages){
                form.setError(field as keyof RepairJobFormValues, { type: 'manual', message: messages[0] });
            }
        })
    } else {
      toast({
        variant: "destructive",
        title: t('repairs.saveFailed'),
        description: result.error || t('errors.unknown'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id")} />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="customerName">{t("repairs.customerName")}</Label>
            <Input id="customerName" {...register("customerName")} />
            {formState.errors.customerName && <p className="text-sm text-destructive">{formState.errors.customerName.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="customerPhone">{t("repairs.customerPhone")}</Label>
            <Input id="customerPhone" {...register("customerPhone")} />
            {formState.errors.customerPhone && <p className="text-sm text-destructive">{formState.errors.customerPhone.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="deviceModel">{t("repairs.deviceModel")}</Label>
            <Input id="deviceModel" {...register("deviceModel")} />
            {formState.errors.deviceModel && <p className="text-sm text-destructive">{formState.errors.deviceModel.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="imei">{t("repairs.imei")}</Label>
            <Input id="imei" {...register("imei")} />
            {formState.errors.imei && <p className="text-sm text-destructive">{formState.errors.imei.message}</p>}
        </div>
      </div>

       <div className="space-y-2">
          <Label htmlFor="reportedProblem">{t("repairs.reportedProblem")}</Label>
          <Textarea id="reportedProblem" {...register("reportedProblem")} />
          {formState.errors.reportedProblem && <p className="text-sm text-destructive">{formState.errors.reportedProblem.message}</p>}
      </div>

       <div className="space-y-2">
          <Label htmlFor="notes">{t("repairs.notes")}</Label>
          <Textarea id="notes" {...register("notes")} />
          {formState.errors.notes && <p className="text-sm text-destructive">{formState.errors.notes.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="status">{t('repairs.status')}</Label>
            <Select value={watch('status')} onValueChange={(value: RepairJobFormValues['status']) => setValue('status', value)}>
                <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    {statuses.map(status => (
                        <SelectItem key={status} value={status}>{t(`repairs.statuses.${status}`)}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {formState.errors.status && <p className="text-sm text-destructive">{formState.errors.status.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="boxNumber">{t("repairs.boxNumber")}</Label>
            <Input id="boxNumber" type="number" {...register("boxNumber")} />
            {formState.errors.boxNumber && <p className="text-sm text-destructive">{formState.errors.boxNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedCost">{t("repairs.estimatedCost")}</Label>
          <Input id="estimatedCost" type="number" step="0.01" {...register("estimatedCost")} />
          {formState.errors.estimatedCost && <p className="text-sm text-destructive">{formState.errors.estimatedCost.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="finalCost">{t("repairs.finalCost")}</Label>
            <Input id="finalCost" type="number" step="0.01" {...register("finalCost")} />
            {formState.errors.finalCost && <p className="text-sm text-destructive">{formState.errors.finalCost.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {formState.isSubmitting ? t("inventory.saving") : t("inventory.save")}
      </Button>
    </form>
  );
}
