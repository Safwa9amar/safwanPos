
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import prisma from "@/lib/prisma";

const UpdateProfileSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1, "Display name is required"),
});

export async function updateProfile(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = UpdateProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { uid, name } = validatedFields.data;

  try {
    await prisma.user.update({
        where: { id: uid },
        data: { name }
    });
    revalidatePath("/settings/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return { error: error.message || "Failed to update profile." };
  }
}

const ChangePasswordSchema = z.object({
  uid: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function changePassword(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = ChangePasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { uid, newPassword } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
        where: { id: uid },
        data: { password: hashedPassword }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to change password:", error);
    return { error: error.message || "Failed to change password." };
  }
}
