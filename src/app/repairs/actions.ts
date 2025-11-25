
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RepairJobSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  deviceModel: z.string().min(1, "Device model is required"),
  imei: z.string().optional(),
  reportedProblem: z.string().min(1, "Reported problem is required"),
  notes: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  estimatedCost: z.coerce.number().optional(),
  finalCost: z.coerce.number().optional(),
  boxNumber: z.coerce.number().optional(),
  userId: z.string().min(1),
});

export async function getRepairJobs(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const jobs = await prisma.repairJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { jobs };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch repair jobs" };
  }
}

export async function upsertRepairJob(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  
  if (values.estimatedCost === '') values.estimatedCost = undefined;
  if (values.finalCost === '') values.finalCost = undefined;
  if (values.boxNumber === '') values.boxNumber = undefined;

  const validatedFields = RepairJobSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, userId, ...data } = validatedFields.data;
  if (!userId) return { error: "Authentication error." };

  try {
    if (id) {
        const existingJob = await prisma.repairJob.findFirst({ where: { id, userId }});
        if (!existingJob) return { error: "Repair job not found or access denied." };
    }
    const job = await prisma.repairJob.upsert({
      where: { id: id || "" },
      update: data,
      create: { ...data, userId },
    });
    revalidatePath("/repairs");
    return { success: true, job };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save repair job." };
  }
}

export async function deleteRepairJob(jobId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const existingJob = await prisma.repairJob.findFirst({ where: { id: jobId, userId }});
        if (!existingJob) return { error: "Repair job not found or access denied." };
        
        await prisma.repairJob.delete({ where: { id: jobId }});
        revalidatePath('/repairs');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete repair job." };
    }
}
