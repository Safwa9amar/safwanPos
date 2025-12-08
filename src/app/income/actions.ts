
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/server-auth";

// --- Income Entry Actions ---

const IncomeEntrySchema = z.object({
  id: z.string().optional(),
  details: z.string().min(1, "Details are required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  entryDate: z.coerce.date(),
  categoryId: z.string().min(1, "Category is required"),
  userId: z.string().min(1),
});

export async function getIncomeEntries(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const entries = await prisma.capitalEntry.findMany({
      where: { userId },
      orderBy: { entryDate: "desc" },
      include: { IncomeCategory: true },
    });
    return { entries };
  } catch (error) {
    console.error("Failed to fetch income entries:", error);
    return { error: "Failed to fetch income entries." };
  }
}

export async function upsertIncomeEntry(formData: FormData) {
  const userId = await getUserIdFromRequest();
  if (!userId) return { error: "User not authenticated." };
  
  const values = Object.fromEntries(formData.entries());
  const validatedFields = IncomeEntrySchema.safeParse({ ...values, userId });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, categoryId, ...data } = validatedFields.data;
  const dataToSave = { ...data, IncomeCategoryId: categoryId };


  try {
    if (id) {
        const existingEntry = await prisma.capitalEntry.findFirst({ where: { id, userId }});
        if (!existingEntry) {
            return { error: "Entry not found or access denied." };
        }
    }
    await prisma.capitalEntry.upsert({
      where: { id: id || "" },
      update: dataToSave,
      create: dataToSave,
    });
    revalidatePath("/income");
    return { success: true };
  } catch (error) {
    console.error("Failed to add income entry:", error);
    return { error: "Failed to save income entry." };
  }
}


export async function deleteIncomeEntry(id: string) {
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
        console.error("Failed to delete income entry:", error);
        return { error: "Failed to delete income entry." };
    }
}


// --- Income Category Actions ---

const IncomeCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  userId: z.string().min(1),
});

export async function getIncomeCategories(userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const categories = await prisma.incomeCategory.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
        return { categories };
    } catch (error) {
        console.error("Failed to fetch income categories:", error);
        return { error: "Failed to fetch income categories." };
    }
}

export async function upsertIncomeCategory(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = IncomeCategorySchema.safeParse(values);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, name, userId } = validatedFields.data;
    if (!userId) return { message: "Authentication error." };

    try {
        const existingCategory = await prisma.incomeCategory.findFirst({
            where: { 
                name,
                userId, 
                NOT: { id: id || undefined }
            }
        });

        if (existingCategory) {
            return { errors: { name: ["A category with this name already exists."] }};
        }
        
        if (id) {
            const categoryToUpdate = await prisma.incomeCategory.findFirst({ where: { id, userId }});
            if (!categoryToUpdate) return { message: "Category not found or access denied." };
        }

        await prisma.incomeCategory.upsert({
            where: { id: id || '' },
            create: { name, userId },
            update: { name }
        });
        revalidatePath('/income');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { message: "Failed to save category." };
    }
}

export async function deleteIncomeCategory(categoryId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const categoryToDelete = await prisma.incomeCategory.findFirst({ where: { id: categoryId, userId }});
        if (!categoryToDelete) return { error: "Category not found or access denied." };

        await prisma.incomeCategory.delete({
            where: { id: categoryId }
        });
        revalidatePath('/income');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2003') {
             return { error: 'Cannot delete category with existing income entries.' };
        }
        console.error(error);
        return { error: 'Failed to delete category.' };
    }
}
