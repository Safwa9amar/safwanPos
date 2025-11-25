
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
  stock: z.coerce.number().min(0, "Stock cannot be negative for items sold by EACH. For weighted items, this can be a decimal."),
  categoryId: z.string().optional().nullable(),
  unit: z.enum(["EACH", "KG", "G", "L", "ML"]),
  image: z.string().url().optional().or(z.literal('')),
  userId: z.string().min(1),
});

export async function getProducts(userId: string) {
  if (!userId) return { error: "User not authenticated" };
  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { category: true }
    });
    return { products };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch products" };
  }
}

export async function addProduct(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  if (values.categoryId === 'null' || values.categoryId === '') {
    values.categoryId = null;
  }
  
  const validatedFields = ProductSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { userId, name, barcode, price, stock, costPrice, categoryId, unit, image } = validatedFields.data;
  if (!userId) return { message: "Authentication error." };

  try {
    const existingProduct = await prisma.product.findFirst({ where: { barcode, userId } });
    if(existingProduct) {
        return {
            errors: {
                barcode: ["A product with this barcode already exists."]
            }
        }
    }

    await prisma.product.create({
      data: { 
        userId,
        name, 
        barcode, 
        price, 
        stock, 
        costPrice,
        categoryId: categoryId || null,
        unit,
        image: image || null,
      },
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
    if (values.categoryId === 'null' || values.categoryId === '') {
      values.categoryId = null;
    }

    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, userId, name, barcode, price, stock, costPrice, categoryId, unit, image } = validatedFields.data;

    if (!id) return { message: "Product ID is missing." };
    if (!userId) return { message: "Authentication error." };

    try {
        const productToUpdate = await prisma.product.findFirst({ where: { id, userId }});
        if (!productToUpdate) {
            return { message: "Product not found or access denied." };
        }
        
        const existingBarcode = await prisma.product.findFirst({ 
            where: { 
                barcode,
                userId,
                NOT: { id: id }
            } 
        });

        if(existingBarcode) {
            return {
                errors: {
                    barcode: ["A different product with this barcode already exists."]
                }
            }
        }

        await prisma.product.update({
            where: { id },
            data: { 
                name, 
                barcode, 
                price, 
                stock, 
                costPrice,
                categoryId: categoryId || null,
                unit,
                image: image || null
            },
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

export async function deleteProduct(productId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const productToDelete = await prisma.product.findFirst({ where: { id: productId, userId }});
        if (!productToDelete) return { error: "Product not found or access denied." };

        await prisma.product.delete({ where: { id: productId } })
        revalidatePath('/inventory');
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2003' || error.code === 'P2025') {
            return { error: "Cannot delete this product because it is part of a past sale or doesn't exist." };
        }
        console.error(error);
        return { error: 'Failed to delete product.' }
    }
}

const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  userId: z.string().min(1),
});

export async function getCategories(userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
        return { categories };
    } catch (error) {
        console.error(error);
        return { error: "Failed to fetch categories." };
    }
}

export async function upsertCategory(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = CategorySchema.safeParse(values);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, name, userId } = validatedFields.data;
    if (!userId) return { message: "Authentication error." };

    try {
        const existingCategory = await prisma.category.findFirst({
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
            const categoryToUpdate = await prisma.category.findFirst({ where: { id, userId }});
            if (!categoryToUpdate) return { message: "Category not found or access denied." };
        }

        await prisma.category.upsert({
            where: { id: id || '' },
            create: { name, userId },
            update: { name }
        });
        revalidatePath('/inventory/categories');
        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { message: "Failed to save category." };
    }
}

export async function deleteCategory(categoryId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const categoryToDelete = await prisma.category.findFirst({ where: { id: categoryId, userId }});
        if (!categoryToDelete) return { error: "Category not found or access denied." };

        await prisma.product.updateMany({
            where: { categoryId: categoryId, userId },
            data: { categoryId: null }
        });

        await prisma.category.delete({
            where: { id: categoryId }
        });
        revalidatePath('/inventory/categories');
        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to delete category.' };
    }
}
