
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  address: z.string().optional(),
  userId: z.string().min(1),
});

export async function getCustomers(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const customers = await prisma.customer.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    const totalDebt = await prisma.customer.aggregate({
        _sum: {
            balance: true,
        },
        where: {
            userId,
            balance: {
                gt: 0,
            }
        }
    });
    return { customers, totalDebt: totalDebt._sum.balance || 0 };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch customers" };
  }
}

export async function getCustomerById(id: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const customer = await prisma.customer.findFirst({
            where: { id, userId },
            include: {
                sales: {
                  include: {
                    items: {
                      include: {
                        product: {
                          select: { name: true }
                        }
                      }
                    }
                  },
                  orderBy: { saleDate: 'desc' }
                },
                payments: {
                  orderBy: { paymentDate: 'desc' }
                }
            }
        });
        if (!customer) return { error: "Customer not found or access denied." };
        return { customer };
    } catch (error) {
        console.error(error);
        return { error: "Failed to fetch customer details." };
    }
}

export async function upsertCustomer(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = CustomerSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, userId, ...data } = validatedFields.data;
  
  if (!userId) {
    return { message: "Authentication error." };
  }

  try {
    if (id) {
        // Ensure the user owns the customer record they are trying to update
        const existingCustomer = await prisma.customer.findFirst({ where: { id, userId }});
        if (!existingCustomer) {
            return { message: "Customer not found or access denied."};
        }
    }
    const customer = await prisma.customer.upsert({
      where: { id: id || "" },
      update: data,
      create: { ...data, userId },
    });
    revalidatePath("/customers");
    if(id) revalidatePath(`/customers/${id}`);
    return { success: true, customer };
  } catch (error) {
    console.error(error);
    return { message: "Failed to save customer." };
  }
}

export async function deleteCustomer(customerId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const customer = await prisma.customer.findFirst({ where: { id: customerId, userId }});
        if (!customer) {
             return { error: "Customer not found or access denied." };
        }
        if (customer.balance !== 0) {
            return { error: "Cannot delete customer with an outstanding balance."}
        }
        await prisma.customer.delete({ where: { id: customerId }});
        revalidatePath('/customers');
        return { success: true };
    } catch (error: any) {
        if(error.code === 'P2003'){
            return { error: "Cannot delete customer with existing sales."}
        }
        console.error(error);
        return { error: "Failed to delete customer." };
    }
}

const PaymentSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    amount: z.coerce.number().positive("Payment amount must be positive"),
    notes: z.string().optional(),
    userId: z.string().min(1),
});

export async function addPayment(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = PaymentSchema.safeParse(values);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { customerId, amount, notes, userId } = validatedFields.data;

    try {
        // Verify user owns the customer before adding a payment
        const customer = await prisma.customer.findFirst({ where: { id: customerId, userId }});
        if (!customer) {
            return { error: "Customer not found or access denied." };
        }

        await prisma.$transaction(async (tx) => {
            await tx.payment.create({
                data: {
                    customerId,
                    amount,
                    notes,
                    userId
                }
            });

            await tx.customer.update({
                where: { id: customerId },
                data: {
                    balance: {
                        decrement: amount
                    }
                }
            });
        });

        revalidatePath(`/customers/${customerId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add payment:", error);
        return { error: "Failed to record payment." };
    }
}
