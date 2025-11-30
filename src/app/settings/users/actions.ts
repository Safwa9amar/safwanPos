
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { SubscriptionStatus, UserRole } from "@prisma/client";

const UserFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(UserRole),
  password: z.string().optional(),
  adminId: z.string().min(1),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus).optional(),
  trialEndsAt: z.coerce.date().optional().nullable(),
});

export async function getUsers(adminId: string) {
    if (!adminId) {
        return { error: "User not authenticated." };
    }
    try {
        // Fetch the admin user and all users they have created.
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { id: adminId }, // The admin themself
                    { createdById: adminId } // Users created by the admin
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return { users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { error: "Failed to load users." };
    }
}


export async function upsertUser(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  
  // Handle empty strings for optional date
  if (values.trialEndsAt === '') {
      values.trialEndsAt = null;
  }

  const validatedFields = UserFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { id, name, email, role, password, adminId, subscriptionStatus, trialEndsAt } = validatedFields.data;

  try {
    if (id) {
        // Update user
        const userToUpdate = await prisma.user.findFirst({
            where: {
                id,
                OR: [
                    { id: adminId }, // Admin can edit their own profile
                    { createdById: adminId } // Admin can edit users they created
                ]
            }
        });

        if (!userToUpdate) {
            return { error: "User not found or you do not have permission to edit this user." };
        }

        const updateData: any = { name, email, role, subscriptionStatus, trialEndsAt };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/settings/users");
        return { success: true, user: updatedUser };

    } else {
      // Create a brand new user (staff)
      if (!password) {
        return { errors: { password: ["Password is required for new users."] } };
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return { errors: { email: ["This email address is already in use."] } };
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role,
          password: hashedPassword,
          createdById: adminId, // Link new user to the creating admin
          emailVerified: new Date(), // Staff accounts are pre-verified
          subscriptionStatus: subscriptionStatus || 'TRIAL',
          trialEndsAt: trialEndsAt
        },
      });
      revalidatePath("/settings/users");
      return { success: true, user: newUser };
    }
  } catch (error: any) {
    console.error("Error upserting user:", error);
     if (error.code === 'P2002') { // Unique constraint violation
      return { errors: { email: ["This email address is already in use."] } };
    }
    return { error: error.message || "An unknown error occurred." };
  }
}

export async function deleteUser(userId: string, adminId: string) {
    try {
        const userToDelete = await prisma.user.findFirst({
            where: { id: userId, createdById: adminId }
        });

        if (!userToDelete) {
             return { error: "User not found or you do not have permission to delete this user." };
        }

        await prisma.user.delete({ where: { id: userId } });
        
        revalidatePath("/settings/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { error: error.message || "Failed to delete user." };
    }
}
