"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  barcode: z.string().min(1, "Barcode is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return { products };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch products" };
  }
}

export async function addProduct(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = ProductSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, barcode, price, stock, costPrice } = validatedFields.data;

  try {
    const existingProduct = await prisma.product.findUnique({ where: { barcode } });
    if(existingProduct) {
        return {
            errors: {
                barcode: ["A product with this barcode already exists."]
            }
        }
    }

    await prisma.product.create({
      data: { name, barcode, price, stock, costPrice },
    });

    revalidatePath("/inventory");
    revalidatePath("/pos");
    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { message: "Failed to add product" };
  }
}


export async function updateProduct(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, name, barcode, price, stock, costPrice } = validatedFields.data;

    if (!id) {
        return { message: "Product ID is missing." };
    }

    try {
        const existingProduct = await prisma.product.findFirst({ 
            where: { 
                barcode,
                NOT: {
                    id: id
                }
            } 
        });

        if(existingProduct) {
            return {
                errors: {
                    barcode: ["A different product with this barcode already exists."]
                }
            }
        }

        await prisma.product.update({
            where: { id },
            data: { name, barcode, price, stock, costPrice },
        });

        revalidatePath("/inventory");
        revalidatePath("/pos");
        revalidatePath("/suppliers");
        return { success: true };

    } catch (error) {
        console.error(error);
        return { message: "Failed to update product" };
    }
}

export async function deleteProduct(productId: string) {
    try {
        await prisma.product.delete({
            where: { id: productId }
        })
        revalidatePath('/inventory');
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2003' || error.code === 'P2025') { // Foreign key constraint or record not found
            return { error: "Cannot delete this product because it is part of a past sale or doesn't exist." };
        }
        console.error(error);
        return { error: 'Failed to delete product.' }
    }
}
