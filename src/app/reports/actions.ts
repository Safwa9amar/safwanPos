"use server";

import { generateBusinessReport } from "@/ai/flows/business-report-tool";
import prisma from "@/lib/prisma";
import { endOfDay, startOfDay, subDays } from "date-fns";

export async function getBusinessReport(language: string) {
    try {
        const thirtyDaysAgo = subDays(new Date(), 30);

        const sales = await prisma.sale.findMany({
            where: { saleDate: { gte: thirtyDaysAgo } },
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
        });
        
        const expenses = await prisma.expense.findMany({
             where: { expenseDate: { gte: thirtyDaysAgo } },
             orderBy: { expenseDate: 'desc' }
        });

        const purchaseOrders = await prisma.purchaseOrder.findMany({
             where: { orderDate: { gte: thirtyDaysAgo } },
             orderBy: { orderDate: 'desc' }
        });


        if (sales.length === 0 && expenses.length === 0 && purchaseOrders.length === 0) {
            return { summary: "No data available to generate a report." };
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
                costPerItem: item.product.costPrice,
                currentStock: item.product.stock,
            })),
        }));
        
        const expensesDataForAI = expenses.map(e => ({
            description: e.description,
            amount: e.amount,
            date: e.expenseDate
        }));

        const purchaseDataForAI = purchaseOrders.map(p => ({
            orderId: p.id,
            date: p.orderDate,
            totalCost: p.totalCost,
            status: p.status
        }));

        const report = await generateBusinessReport({
            salesData: JSON.stringify(salesDataForAI, null, 2),
            expenseData: JSON.stringify(expensesDataForAI, null, 2),
            purchaseData: JSON.stringify(purchaseDataForAI, null, 2),
            language: language,
        });

        return report;

    } catch (error: any) {
        console.error("Failed to generate business report:", error);
        return { error: "Failed to generate business report. " + error.message };
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
