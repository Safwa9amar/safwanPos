"use server";

import { auth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuth } from "firebase-admin/auth";
import { UserRole } from "@prisma/client";

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { error: "Failed to load users." };
    }
}

const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(UserRole),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export async function upsertUser(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = UserSchema.safeParse(values);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { id, name, email, role, password } = validatedFields.data;

  try {
    if (id) {
      // Update existing user
      await getAuth(auth).updateUser(id, {
        email,
        displayName: name,
        ...(password && { password }), // Only update password if provided
      });

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { name, email, role },
      });

      revalidatePath("/settings/users");
      return { success: true, user: updatedUser };

    } else {
      // Create new user
      if (!password) {
        return { errors: { password: ["Password is required for new users."] } };
      }
      const firebaseUser = await getAuth(auth).createUser({
        email,
        password,
        displayName: name,
      });

      const newUser = await prisma.user.create({
        data: {
          id: firebaseUser.uid,
          name,
          email,
          role,
        },
      });
      revalidatePath("/settings/users");
      return { success: true, user: newUser };
    }
  } catch (error: any) {
    console.error("Error upserting user:", error);
    if (error.code === 'auth/email-already-exists') {
      return { errors: { email: ["This email address is already in use."] } };
    }
    return { error: error.message || "An unknown error occurred." };
  }
}

export async function deleteUser(userId: string) {
    try {
        // You might want to check if the user being deleted is the last ADMIN
        // For simplicity, we'll skip that check here.

        await getAuth(auth).deleteUser(userId);
        await prisma.user.delete({ where: { id: userId } });
        
        revalidatePath("/settings/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { error: error.message || "Failed to delete user." };
    }
}
