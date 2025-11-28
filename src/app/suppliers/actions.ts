
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PurchaseOrderItem } from "@/types";
import { SupplierStatus } from "@prisma/client";

const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  category: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliverySchedule: z.string().optional(),
  communicationChannel: z.string().optional(),
  status: z.nativeEnum(SupplierStatus),
  userId: z.string().min(1),
});

export async function getSuppliers(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return { suppliers };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch suppliers" };
  }
}

export async function getSupplierById(id: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const supplier = await prisma.supplier.findFirst({
            where: { id, userId },
            include: {
                purchaseOrders: {
                    orderBy: { orderDate: 'desc' }
                }
            }
        });
        if (!supplier) return { error: "Supplier not found or access denied." };
        return { supplier };
    } catch (error) {
        console.error(error);
        return { error: "Failed to fetch supplier details." };
    }
}

export async function upsertSupplier(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = SupplierSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, userId, ...data } = validatedFields.data;
  if (!userId) return { message: "Authentication error." };

  try {
    if (id) {
        const existingSupplier = await prisma.supplier.findFirst({ where: { id, userId }});
        if (!existingSupplier) return { message: "Supplier not found or access denied." };
    }
    const supplier = await prisma.supplier.upsert({
      where: { id: id || "" },
      update: data,
      create: { ...data, userId },
    });
    revalidatePath("/suppliers");
    if(id) revalidatePath(`/suppliers/${id}`);
    return { success: true, supplier };
  } catch (error) {
    console.error(error);
    return { message: "Failed to save supplier." };
  }
}

export async function deleteSupplier(supplierId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, userId }});
        if (!supplier) return { error: "Supplier not found or access denied." };

        await prisma.supplier.delete({ where: { id: supplierId }});
        revalidatePath('/suppliers');
        return { success: true };
    } catch (error: any) {
        if(error.code === 'P2003'){
            return { error: "Cannot delete supplier with existing purchase orders."}
        }
        console.error(error);
        return { error: "Failed to delete supplier." };
    }
}


const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1),
  expectedDeliveryDate: z.date().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    costPrice: z.number().min(0),
  })).min(1, "Order must have at least one item."),
  userId: z.string().min(1),
});

export async function createPurchaseOrder(
    userId: string,
    supplierId: string,
    items: { productId: string; quantity: number; costPrice: number }[],
    expectedDate: Date | undefined
) {
    const validation = PurchaseOrderSchema.safeParse({
        userId,
        supplierId,
        items,
        expectedDeliveryDate: expectedDate
    });

    if (!validation.success) {
        console.error(validation.error.flatten().fieldErrors);
        return { error: "Invalid purchase order data." };
    }

    try {
        const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, userId } });
        if (!supplier) return { error: "Supplier not found or access denied." };

        const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                userId,
                supplierId,
                expectedDeliveryDate: expectedDate,
                totalCost,
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        costPrice: item.costPrice,
                    }))
                }
            }
        });
        revalidatePath(`/suppliers/${supplierId}`);
        return { success: true, purchaseOrder };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create purchase order." };
    }
}

export async function completePurchaseOrder(purchaseOrderId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const purchaseOrder = await prisma.purchaseOrder.findFirst({
            where: { id: purchaseOrderId, userId },
            include: { items: true },
        });

        if (!purchaseOrder) {
            return { error: "Purchase order not found." };
        }

        if(purchaseOrder.status === 'COMPLETED'){
            return { error: "Purchase order is already completed."}
        }

        await prisma.$transaction(async (tx) => {
            // Update the product stock for each item in the purchase order
            for (const item of purchaseOrder.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            // Update the status of the purchase order
            await tx.purchaseOrder.update({
                where: { id: purchaseOrderId },
                data: { status: 'COMPLETED' },
            });
        });

        revalidatePath(`/suppliers/${purchaseOrder.supplierId}`);
        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error("Failed to complete purchase order:", error);
        return { error: "An error occurred while completing the order." };
    }
}
