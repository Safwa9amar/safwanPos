
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
});

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
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
  // Handle empty string for categoryId
  if (values.categoryId === 'null' || values.categoryId === '') {
    values.categoryId = null;
  }
  
  const validatedFields = ProductSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { name, barcode, price, stock, costPrice, categoryId, unit, image } = validatedFields.data;

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
      data: { 
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
    // Handle empty string for categoryId
    if (values.categoryId === 'null' || values.categoryId === '') {
      values.categoryId = null;
    }

    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, name, barcode, price, stock, costPrice, categoryId, unit, image } = validatedFields.data;

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


// --- Category Actions ---
const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
});

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
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

    const { id, name } = validatedFields.data;

    try {
        const existingCategory = await prisma.category.findFirst({
            where: { 
                name, 
                NOT: { id: id || undefined }
            }
        });

        if (existingCategory) {
            return { errors: { name: ["A category with this name already exists."] }};
        }

        await prisma.category.upsert({
            where: { id: id || '' },
            create: { name },
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

export async function deleteCategory(categoryId: string) {
    try {
        // We need to un-link products before deleting the category
        await prisma.product.updateMany({
            where: { categoryId: categoryId },
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
