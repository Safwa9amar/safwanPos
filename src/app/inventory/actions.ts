
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  barcodes: z.array(z.string().min(1, "Barcode cannot be empty")).min(1, "At least one barcode is required"),
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
      include: { category: true, barcodes: true }
    });
    return { products };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch products" };
  }
}

export async function addProduct(formData: FormData) {
  const values = {
    name: formData.get('name'),
    price: formData.get('price'),
    costPrice: formData.get('costPrice'),
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId'),
    unit: formData.get('unit'),
    image: formData.get('image'),
    userId: formData.get('userId'),
    barcodes: formData.getAll('barcodes[]'),
  };

  if (values.categoryId === 'null' || values.categoryId === '') {
    values.categoryId = null;
  }
  
  const validatedFields = ProductSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { userId, name, barcodes, price, stock, costPrice, categoryId, unit, image } = validatedFields.data;
  if (!userId) return { message: "Authentication error." };

  try {
    // Check for barcode uniqueness
    const existingBarcodes = await prisma.barcode.findMany({
        where: { code: { in: barcodes }, userId }
    });

    if(existingBarcodes.length > 0) {
        return {
            errors: {
                barcodes: [`Barcode(s) already exist: ${existingBarcodes.map(b => b.code).join(', ')}`]
            }
        }
    }

    await prisma.product.create({
      data: {
        name, 
        price, 
        stock, 
        costPrice,
        unit,
        image: image || null,
        user: { connect: { id: userId } },
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        barcodes: {
          create: barcodes.map(code => ({
            code,
            userId,
          }))
        }
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
    const values = {
        id: formData.get('id'),
        name: formData.get('name'),
        price: formData.get('price'),
        costPrice: formData.get('costPrice'),
        stock: formData.get('stock'),
        categoryId: formData.get('categoryId'),
        unit: formData.get('unit'),
        image: formData.get('image'),
        userId: formData.get('userId'),
        barcodes: formData.getAll('barcodes[]'),
    };

    if (values.categoryId === 'null' || values.categoryId === '') {
      values.categoryId = null;
    }

    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { id, userId, name, barcodes, price, stock, costPrice, categoryId, unit, image } = validatedFields.data;

    if (!id) return { message: "Product ID is missing." };
    if (!userId) return { message: "Authentication error." };

    try {
        const productToUpdate = await prisma.product.findFirst({ where: { id, userId }});
        if (!productToUpdate) {
            return { message: "Product not found or access denied." };
        }
        
        const existingBarcode = await prisma.barcode.findFirst({ 
            where: { 
                code: { in: barcodes },
                userId,
                NOT: { productId: id }
            } 
        });

        if(existingBarcode) {
            return {
                errors: {
                    barcodes: [`Barcode ${existingBarcode.code} is already in use by another product.`]
                }
            }
        }

        await prisma.$transaction(async (tx) => {
            // Update product details
            await tx.product.update({
                where: { id },
                data: { 
                    name, 
                    price, 
                    stock, 
                    costPrice,
                    categoryId: categoryId || null,
                    unit,
                    image: image || null
                },
            });
            // Delete old barcodes
            await tx.barcode.deleteMany({
                where: { productId: id }
            });
            // Create new barcodes
            await tx.barcode.createMany({
                data: barcodes.map(code => ({
                    code,
                    productId: id,
                    userId,
                }))
            });
        })

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

export async function importProducts(userId: string, products: any[]) {
    if (!userId) {
        return { error: "User not authenticated." };
    }

    const ProductImportSchema = z.object({
        name: z.string(),
        barcode: z.string(), // Keep barcode for primary import key
        price: z.coerce.number(),
        costPrice: z.coerce.number().optional().default(0),
        stock: z.coerce.number(),
        unit: z.enum(["EACH", "KG", "G", "L", "ML"]).optional().default("EACH"),
        image: z.string().optional(),
    });
    
    let processed = 0;
    let errors: { row: number, error: string }[] = [];

    for (const [index, p] of products.entries()) {
        const validated = ProductImportSchema.safeParse(p);
        if (!validated.success) {
            errors.push({ row: index + 1, error: validated.error.flatten().fieldErrors.toString() });
            continue;
        }

        const { barcode, ...productData } = validated.data;
        try {
             const product = await prisma.product.upsert({
                where: {
                    // This assumes the first barcode is the "main" one for upserting
                    // A more complex import might require a different unique key
                    // For now, we find a product if it has this barcode
                    id: (await prisma.barcode.findFirst({where: {code: barcode, userId}}))?.productId || ''
                },
                update: {
                    name: productData.name,
                    price: productData.price,
                    costPrice: productData.costPrice,
                    stock: productData.stock,
                    unit: productData.unit,
                    image: productData.image,
                },
                create: {
                    ...productData,
                    userId: userId,
                    barcodes: {
                        create: { code: barcode, userId }
                    }
                },
            });

             // Ensure barcode exists if product was updated but didn't have it
            const hasBarcode = await prisma.barcode.count({ where: { code: barcode, productId: product.id }});
            if (hasBarcode === 0) {
                await prisma.barcode.create({ data: { code: barcode, productId: product.id, userId }});
            }

            processed++;
        } catch (e: any) {
            errors.push({ row: index + 1, error: e.message || "Failed to upsert product." });
        }
    }
    
    revalidatePath("/inventory");
    revalidatePath("/pos");
    
    return { success: true, processed, errors };
}

export async function importCategories(userId: string, categories: any[]) {
    if (!userId) {
        return { error: "User not authenticated." };
    }

    const CategoryImportSchema = z.object({
        name: z.string().min(1, "Name is required"),
    });
    
    let processed = 0;
    let errors: { row: number, error: string }[] = [];

    for (const [index, p] of categories.entries()) {
        const validated = CategoryImportSchema.safeParse(p);
        if (!validated.success) {
            errors.push({ row: index + 1, error: JSON.stringify(validated.error.flatten().fieldErrors) });
            continue;
        }

        const categoryData = validated.data;
        try {
            await prisma.category.upsert({
                where: { name_userId: { name: categoryData.name, userId } },
                update: {},
                create: {
                    name: categoryData.name,
                    userId: userId,
                },
            });
            processed++;
        } catch (e: any) {
            errors.push({ row: index + 1, error: e.message || "Failed to upsert category." });
        }
    }
    
    revalidatePath("/inventory/categories");
    revalidatePath("/inventory");
    
    return { success: true, processed, errors };
}

    