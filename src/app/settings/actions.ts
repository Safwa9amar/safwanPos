
"use server";

import { adminAuth } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  uid: z.string().min(1),
  displayName: z.string().min(1, "Display name is required"),
});

export async function updateProfile(formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = UpdateProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { uid, displayName } = validatedFields.data;

  try {
    await adminAuth.updateUser(uid, { displayName });
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

  try {
    await adminAuth.updateUser(uid, { password: newPassword });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to change password:", error);
    return { error: error.message || "Failed to change password." };
  }
}
