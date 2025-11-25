"use server";

import { generateSalesReport } from "@/ai/flows/sales-reporting-tool";
import prisma from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export async function getSalesReport(language: string) {
    try {
        const sales = await prisma.sale.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                saleDate: 'desc',
            },
            take: 100, // Limit to recent sales for analysis
        });

        if (sales.length === 0) {
            return { summary: "No sales data available to generate a report." };
        }

        const salesDataForAI = sales.map(sale => ({
            saleId: sale.id,
            date: sale.saleDate,
            total: sale.totalAmount,
            items: sale.items.map(item => ({
                productId: item.productId,
                productName: item.product.name,
                quantitySold: item.quantity,
                pricePerItem: item.price,
                currentStock: item.product.stock,
            })),
        }));

        const report = await generateSalesReport({
            salesData: JSON.stringify(salesDataForAI, null, 2),
            language: language,
        });

        return report;

    } catch (error: any) {
        console.error("Failed to generate sales report:", error);
        return { error: "Failed to generate sales report. " + error.message };
    }
}

export async function getSalesHistory(options: { dateFrom?: Date; dateTo?: Date; }) {
    const { dateFrom, dateTo } = options;
    try {
        const sales = await prisma.sale.findMany({
            where: {
                saleDate: {
                    gte: dateFrom ? startOfDay(dateFrom) : undefined,
                    lte: dateTo ? endOfDay(dateTo) : undefined,
                },
            },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, unit: true } },
                    },
                },
                customer: {
                    select: { name: true },
                },
            },
            orderBy: {
                saleDate: 'desc',
            },
        });
        return { sales };
    } catch (error) {
        console.error("Failed to fetch sales history:", error);
        return { error: "Failed to load sales history." };
    }
}
