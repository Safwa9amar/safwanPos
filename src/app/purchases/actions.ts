
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getDirectPurchases(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const purchases = await prisma.directPurchase.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { purchaseDate: 'desc' },
    });
    return { purchases };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch direct purchases." };
  }
}

const PurchaseSchema = z.object({
  storeName: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().positive(),
    costPrice: z.coerce.number().min(0),
  })).min(1, "Purchase must have at least one item."),
  userId: z.string().min(1),
});

export async function createDirectPurchase(
    userId: string,
    items: { productId: string; quantity: number; costPrice: number }[],
    storeName?: string,
    notes?: string,
) {
    const validation = PurchaseSchema.safeParse({
        userId,
        items,
        storeName,
        notes
    });

    if (!validation.success) {
        console.error(validation.error.flatten().fieldErrors);
        return { error: "Invalid purchase data." };
    }

    try {
        const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

        await prisma.$transaction(async (tx) => {
            await tx.directPurchase.create({
                data: {
                    userId,
                    storeName,
                    notes,
                    totalCost,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice,
                        }))
                    }
                }
            });

            // Update product stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
        });

        revalidatePath(`/purchases`);
        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create direct purchase." };
    }
}

export async function deleteDirectPurchase(purchaseId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        return await prisma.$transaction(async (tx) => {
            const purchase = await tx.directPurchase.findFirst({
                where: { id: purchaseId, userId },
                include: { items: true }
            });

            if (!purchase) {
                throw new Error("Purchase not found or access denied.");
            }

            // Decrement stock for each item in the purchase
            for (const item of purchase.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            await tx.directPurchase.delete({ where: { id: purchaseId } });

            revalidatePath(`/purchases`);
            revalidatePath('/inventory');
            return { success: true };
        });
    } catch (error: any) {
        console.error("Failed to delete purchase:", error);
        return { error: error.message };
    }
}
