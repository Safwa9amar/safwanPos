
"use server";

import prisma from '@/lib/prisma';
import { CartItem } from '@/types';
import { revalidatePath } from 'next/cache';
import { PaymentType } from '@prisma/client';

export async function completeSale(
  userId: string,
  items: CartItem[], 
  paymentType: PaymentType, 
  customerId?: string, 
  amountPaid?: number,
  discount?: number,
) {
  if (!userId) {
    return { success: false, error: 'User not authenticated' };
  }
  if (!items || items.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }
  
  try {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Validate amountPaid for non-credit sales
    if (paymentType !== 'CREDIT' && (amountPaid === undefined || amountPaid < totalAmount - (discount || 0))) {
      // Allow for cash/card sales to be slightly less if that's a feature, but for now let's be strict
      // return { success: false, error: 'Amount paid is less than total amount for non-credit sale.' };
    }
    
    const finalAmountPaid = amountPaid === undefined ? totalAmount - (discount || 0) : amountPaid;

    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, userId },
    });

    if (products.length !== productIds.length) {
        return { success: false, error: 'One or more products in the cart could not be found.' };
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product || product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${item.name}. Available: ${product?.stock || 0}, Requested: ${item.quantity}`);
        }
    }
    
    const newSale = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          userId,
          totalAmount,
          discount: discount || 0,
          paymentType,
          customerId: paymentType === 'CREDIT' ? customerId : null,
          amountPaid: finalAmountPaid,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: 0, // Item-specific discounts would be stored here if implemented
            })),
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update customer balance if it's a credit sale
      if (paymentType === 'CREDIT' && customerId) {
        // First verify the customer belongs to the user
        const customer = await tx.customer.findFirst({
            where: { id: customerId, userId },
        });

        if (!customer) {
            throw new Error("Customer not found or access denied.");
        }

        const debt = (totalAmount - (discount || 0)) - finalAmountPaid;
        if (debt > 0) {
          await tx.customer.update({
            where: { id: customerId },
            data: { balance: { increment: debt } },
          });
        }
      }

      return sale;
    });

    revalidatePath('/pos');
    revalidatePath('/reports');
    revalidatePath('/inventory');
    if (customerId) revalidatePath(`/customers/${customerId}`);


    const saleForClient = await prisma.sale.findUnique({
      where: { id: newSale.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, unit: true }
            }
          }
        },
        user: {
          select: { name: true, companyProfile: true }
        },
        customer: {
          select: { name: true, phone: true }
        }
      }
    });

    return { success: true, sale: saleForClient };

  } catch (error: any) {
    console.error("Sale completion failed:", error);
    return { success: false, error: error.message };
  }
}
