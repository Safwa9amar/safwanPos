"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PurchaseOrderItem } from "@/types";

const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    return { suppliers };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch suppliers" };
  }
}

export async function getSupplierById(id: string) {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                purchaseOrders: {
                    orderBy: { orderDate: 'desc' }
                }
            }
        });
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

  const { id, ...data } = validatedFields.data;

  try {
    const supplier = await prisma.supplier.upsert({
      where: { id: id || "" },
      update: data,
      create: data,
    });
    revalidatePath("/suppliers");
    if(id) revalidatePath(`/suppliers/${id}`);
    return { success: true, supplier };
  } catch (error) {
    console.error(error);
    return { message: "Failed to save supplier." };
  }
}

export async function deleteSupplier(supplierId: string) {
    try {
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
});

export async function createPurchaseOrder(
    supplierId: string,
    items: { productId: string; quantity: number; costPrice: number }[],
    expectedDate: Date | undefined
) {
    const validation = PurchaseOrderSchema.safeParse({
        supplierId,
        items,
        expectedDeliveryDate: expectedDate
    });

    if (!validation.success) {
        console.error(validation.error.flatten().fieldErrors);
        return { error: "Invalid purchase order data." };
    }

    try {
        const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                supplierId,
                expectedDeliveryDate: expectedDate,
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
        revalidatePath(`/suppliers/${supplierId}`);
        return { success: true, purchaseOrder };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create purchase order." };
    }
}

export async function completePurchaseOrder(purchaseOrderId: string) {
    try {
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id: purchaseOrderId },
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
