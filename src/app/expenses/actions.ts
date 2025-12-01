
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Expense Actions ---

const ExpenseSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  expenseDate: z.coerce.date(),
  categoryId: z.string().min(1, "Category is required"),
  userId: z.string().min(1),
});

export async function getExpenses(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { expenseDate: "desc" },
      include: { category: true },
    });
    return { expenses };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return { error: "Failed to fetch expenses." };
  }
}

export async function upsertExpense(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = ExpenseSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, userId, ...data } = validatedFields.data;
  
  if (!userId) {
    return { error: "Authentication error." };
  }

  try {
    if (id) {
        const existingExpense = await prisma.expense.findFirst({ where: { id, userId }});
        if (!existingExpense) {
            return { error: "Expense not found or access denied."};
        }
    }

    await prisma.expense.upsert({
      where: { id: id || "" },
      update: data,
      create: { ...data, userId },
    });
    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Failed to save expense:", error);
    return { error: "Failed to save expense." };
  }
}

export async function deleteExpense(expenseId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN') {
            return { error: "You are not authorized to perform this action." };
        }

        const existingExpense = await prisma.expense.findFirst({ where: { id: expenseId, userId }});
        if (!existingExpense) {
            return { error: "Expense not found or access denied."};
        }

        await prisma.expense.delete({ where: { id: expenseId }});
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete expense:", error);
        return { error: "Failed to delete expense." };
    }
}


// --- Expense Category Actions ---

const ExpenseCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  userId: z.string().min(1),
});

export async function getExpenseCategories(userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const categories = await prisma.expenseCategory.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
        return { categories };
    } catch (error) {
        console.error("Failed to fetch expense categories:", error);
        return { error: "Failed to fetch expense categories." };
    }
}

export async function upsertExpenseCategory(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = ExpenseCategorySchema.safeParse(values);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, name, userId } = validatedFields.data;
    if (!userId) return { message: "Authentication error." };

    try {
        const existingCategory = await prisma.expenseCategory.findFirst({
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
            const categoryToUpdate = await prisma.expenseCategory.findFirst({ where: { id, userId }});
            if (!categoryToUpdate) return { message: "Category not found or access denied." };
        }

        await prisma.expenseCategory.upsert({
            where: { id: id || '' },
            create: { name, userId },
            update: { name }
        });
        revalidatePath('/expenses');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { message: "Failed to save category." };
    }
}

export async function deleteExpenseCategory(categoryId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const categoryToDelete = await prisma.expenseCategory.findFirst({ where: { id: categoryId, userId }});
        if (!categoryToDelete) return { error: "Category not found or access denied." };

        await prisma.expenseCategory.delete({
            where: { id: categoryId }
        });
        revalidatePath('/expenses');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2003') {
             return { error: 'Cannot delete category with existing expenses.' };
        }
        console.error(error);
        return { error: 'Failed to delete category.' };
    }
}
