
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/server-auth";

const CapitalEntrySchema = z.object({
  details: z.string().min(1, "Details are required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
});

export async function getCapitalEntries(userId: string) {
  try {
    const entries = await prisma.capitalEntry.findMany({
      where: { userId },
      orderBy: { entryDate: "desc" },
    });
    return { entries };
  } catch (error) {
    console.error("Failed to fetch capital entries:", error);
    return { error: "Failed to fetch income entries." };
  }
}

export async function addCapitalEntry(formData: FormData) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return { error: "User not authenticated." };
  }
  
  const validatedFields = CapitalEntrySchema.safeParse({
    details: formData.get("details"),
    amount: formData.get("amount"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { details, amount } = validatedFields.data;

  try {
    await prisma.capitalEntry.create({
      data: {
        userId,
        details,
        amount,
      },
    });
    revalidatePath("/income");
    return { success: true };
  } catch (error) {
    console.error("Failed to add capital entry:", error);
    return { error: "Failed to save income entry." };
  }
}

export async function deleteCapitalEntry(id: string) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return { error: "User not authenticated." };
    }

    try {
        const entry = await prisma.capitalEntry.findFirst({
            where: { id, userId }
        });

        if (!entry) {
            return { error: "Entry not found or you do not have permission." };
        }

        await prisma.capitalEntry.delete({
            where: { id }
        });
        revalidatePath("/income");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete capital entry:", error);
        return { error: "Failed to delete income entry." };
    }
}
