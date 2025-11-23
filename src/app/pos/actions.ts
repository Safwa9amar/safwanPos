"use server";

import prisma from '@/lib/prisma';
import { CartItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function completeSale(items: CartItem[]) {
  if (!items || items.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }
  
  try {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    });

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
          totalAmount,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    revalidatePath('/pos');
    revalidatePath('/reports');
    revalidatePath('/inventory');

    const saleForClient = await prisma.sale.findUnique({
      where: { id: newSale.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    });

    return { success: true, sale: saleForClient };

  } catch (error: any) {
    console.error("Sale completion failed:", error);
    return { success: false, error: error.message };
  }
}
