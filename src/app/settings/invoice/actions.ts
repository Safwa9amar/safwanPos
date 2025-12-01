"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getCompanyProfile(userId: string) {
    try {
        const profile = await prisma.companyProfile.findUnique({
            where: { userId },
        });
        return { profile };
    } catch (error) {
        console.error("Failed to fetch company profile:", error);
        return { error: "Could not load company profile." };
    }
}

const ProfileSchema = z.object({
    name: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    taxId1Label: z.string().optional(),
    taxId1Value: z.string().optional(),
    taxId2Label: z.string().optional(),
    taxId2Value: z.string().optional(),
    invoiceTitle: z.string().optional(),
    invoiceFooter: z.string().optional(),
});


export async function upsertCompanyProfile(userId: string, formData: FormData) {
    if (!userId) {
        return { error: "User not authenticated." };
    }

    const data = Object.fromEntries(formData.entries());
    const validated = ProfileSchema.safeParse(data);

    if (!validated.success) {
        return { errors: validated.error.flatten().fieldErrors };
    }
    
    try {
        const profile = await prisma.companyProfile.upsert({
            where: { userId },
            update: validated.data,
            create: {
                ...validated.data,
                userId: userId,
            },
        });
        revalidatePath('/settings/invoice');
        return { success: true, profile };
    } catch (error: any) {
        console.error("Error upserting company profile:", error);
        return { error: "Failed to save settings." };
    }
}
