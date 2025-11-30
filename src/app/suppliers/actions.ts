
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupplierStatus } from "@prisma/client";

const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  taxId: z.string().optional(),
  category: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliverySchedule: z.string().optional(),
  communicationChannel: z.string().optional(),
  status: z.nativeEnum(SupplierStatus),
  logoUrl: z.string().url().optional().or(z.literal('')),
  contractStartDate: z.coerce.date().optional().nullable(),
  contractEndDate: z.coerce.date().optional().nullable(),
  monthlySupplyQuota: z.coerce.number().optional(),
  qualityRating: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().optional(),
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
                    include: {
                        items: {
                          include: {
                            product: true
                          }
                        },
                    },
                    orderBy: { orderDate: 'desc' }
                },
                payments: {
                  orderBy: { paymentDate: 'desc' }
                },
                credits: {
                  orderBy: { adjustmentDate: 'desc' }
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

  // Server-side data cleanup before validation
  if (values.contractStartDate === 'null' || values.contractStartDate === '') values.contractStartDate = null;
  if (values.contractEndDate === 'null' || values.contractEndDate === '') values.contractEndDate = null;
  if (values.monthlySupplyQuota === '') delete values.monthlySupplyQuota;
  if (values.qualityRating === '') delete values.qualityRating;


  const validatedFields = SupplierSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...data } = validatedFields.data;
  const userId = formData.get('userId') as string;
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

        const purchaseOrder = await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.create({
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
                            receivedQuantity: 0,
                        }))
                    }
                }
            });
            
            await tx.supplier.update({
                where: { id: supplierId },
                data: {
                    balance: {
                        increment: totalCost
                    }
                }
            });

            return po;
        });


        revalidatePath(`/suppliers/${supplierId}`);
        return { success: true, purchaseOrder };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create purchase order." };
    }
}


export async function deletePurchaseOrder(purchaseOrderId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        return await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findFirst({
                where: { id: purchaseOrderId, userId }
            });

            if (!po) {
                throw new Error("Purchase order not found or access denied.");
            }

            if (po.status !== 'PENDING') {
                throw new Error("Only PENDING purchase orders can be deleted.");
            }

            await tx.supplier.update({
                where: { id: po.supplierId },
                data: { balance: { decrement: po.totalCost } }
            });

            await tx.purchaseOrder.delete({ where: { id: purchaseOrderId } });

            revalidatePath(`/suppliers/${po.supplierId}`);
            return { success: true };
        });
    } catch (error: any) {
        console.error("Failed to delete purchase order:", error);
        return { error: error.message };
    }
}


export async function receivePurchaseOrderItems(
    userId: string,
    purchaseOrderId: string,
    receivedItems: { purchaseOrderItemId: string, receivedNow: number }[]
) {
    if (!userId) return { error: "User not authenticated" };

    try {
        await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findFirst({
                where: { id: purchaseOrderId, userId },
                include: { items: true }
            });
            
            if (!po) throw new Error("Purchase order not found or access denied.");
            
            let allItemsCompleted = true;

            for (const receivedItem of receivedItems) {
                if (receivedItem.receivedNow <= 0) continue;
                
                const poItem = po.items.find(i => i.id === receivedItem.purchaseOrderItemId);
                if (!poItem) throw new Error(`Item with ID ${receivedItem.purchaseOrderItemId} not found in this purchase order.`);
                
                const newReceivedQuantity = poItem.receivedQuantity + receivedItem.receivedNow;
                if (newReceivedQuantity > poItem.quantity) {
                    throw new Error(`Cannot receive more items than ordered for ${poItem.id}.`);
                }

                await tx.purchaseOrderItem.update({
                    where: { id: receivedItem.purchaseOrderItemId },
                    data: {
                        receivedQuantity: newReceivedQuantity
                    }
                });

                await tx.product.update({
                    where: { id: poItem.productId },
                    data: { stock: { increment: receivedItem.receivedNow } }
                });
            }

            const updatedPoItems = await tx.purchaseOrderItem.findMany({
                where: { purchaseOrderId: purchaseOrderId }
            });

            for (const item of updatedPoItems) {
                if (item.receivedQuantity < item.quantity) {
                    allItemsCompleted = false;
                    break;
                }
            }

            const newStatus = allItemsCompleted ? 'COMPLETED' : 'PARTIALLY_RECEIVED';
            
            await tx.purchaseOrder.update({
                where: { id: purchaseOrderId },
                data: { status: newStatus }
            });
        });

        const po = await prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId } });
        revalidatePath(`/suppliers/${po?.supplierId}`);
        revalidatePath('/inventory');
        return { success: true };

    } catch (error: any) {
        console.error("Failed to receive stock:", error);
        return { error: error.message || "An error occurred while receiving stock." };
    }
}

const SupplierPaymentSchema = z.object({
    id: z.string().optional(),
    supplierId: z.string().min(1),
    amount: z.coerce.number().positive("Amount must be positive"),
    notes: z.string().optional(),
    userId: z.string().min(1),
});

export async function upsertSupplierPayment(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = SupplierPaymentSchema.safeParse(values);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, supplierId, amount, notes, userId } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.findFirst({ where: { id: supplierId, userId }});
            if (!supplier) throw new Error("Supplier not found or access denied.");
            
            let amountDifference = amount;

            if (id) {
                const oldPayment = await tx.supplierPayment.findUnique({ where: { id }});
                if(!oldPayment) throw new Error("Payment to update not found.");
                if(oldPayment.supplierId !== supplierId) throw new Error("Cannot change the supplier of a payment.");
                amountDifference = amount - oldPayment.amount;
                
                await tx.supplierPayment.update({
                    where: { id },
                    data: { amount, notes }
                });
            } else {
                await tx.supplierPayment.create({
                    data: { supplierId, userId, amount, notes }
                });
            }

            await tx.supplier.update({
                where: { id: supplierId },
                data: { balance: { decrement: amountDifference } }
            });
        });
        revalidatePath(`/suppliers/${supplierId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to save supplier payment:", error);
        return { error: error.message || "Failed to record payment." };
    }
}

export async function deleteSupplierPayment(paymentId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        return await prisma.$transaction(async (tx) => {
            const payment = await tx.supplierPayment.findFirst({ where: { id: paymentId, userId }});
            if (!payment) throw new Error("Payment not found or access denied.");

            await tx.supplier.update({
                where: { id: payment.supplierId },
                data: { balance: { increment: payment.amount } } // Reverse the payment
            });

            await tx.supplierPayment.delete({ where: { id: paymentId } });
            
            revalidatePath(`/suppliers/${payment.supplierId}`);
            return { success: true };
        });
    } catch (error: any) {
        console.error("Failed to delete supplier payment:", error);
        return { error: error.message || "Failed to delete payment." };
    }
}

const SupplierCreditSchema = z.object({
    id: z.string().optional(),
    supplierId: z.string().min(1),
    amount: z.coerce.number().positive("Amount must be positive"),
    reason: z.string().min(1, "Reason is required"),
    userId: z.string().min(1),
});

export async function upsertSupplierCredit(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = SupplierCreditSchema.safeParse(values);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, supplierId, amount, reason, userId } = validatedFields.data;
    
    try {
        await prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.findFirst({ where: { id: supplierId, userId }});
            if (!supplier) throw new Error("Supplier not found or access denied.");
            
            let amountDifference = amount;

            if (id) {
                const oldCredit = await tx.supplierCredit.findUnique({ where: { id } });
                if (!oldCredit) throw new Error("Credit to update not found.");
                if (oldCredit.supplierId !== supplierId) throw new Error("Cannot change the supplier of a credit.");
                amountDifference = amount - oldCredit.amount;

                await tx.supplierCredit.update({
                    where: { id },
                    data: { amount, reason }
                });
            } else {
                await tx.supplierCredit.create({
                    data: { supplierId, userId, amount, reason }
                });
            }

            await tx.supplier.update({
                where: { id: supplierId },
                data: { balance: { increment: amountDifference } }
            });
        });

        revalidatePath(`/suppliers/${supplierId}`);
        return { success: true };

    } catch (error: any) {
        console.error("Failed to save supplier credit:", error);
        return { error: error.message || "Failed to add credit." };
    }
}


export async function deleteSupplierCredit(creditId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        return await prisma.$transaction(async (tx) => {
            const credit = await tx.supplierCredit.findFirst({ where: { id: creditId, userId } });
            if (!credit) throw new Error("Credit not found or access denied.");

            await tx.supplier.update({
                where: { id: credit.supplierId },
                data: { balance: { decrement: credit.amount } } // Reverse the credit
            });

            await tx.supplierCredit.delete({ where: { id: creditId } });
            
            revalidatePath(`/suppliers/${credit.supplierId}`);
            return { success: true };
        });
    } catch (error: any) {
        console.error("Failed to delete supplier credit:", error);
        return { error: error.message || "Failed to delete credit." };
    }
}

    