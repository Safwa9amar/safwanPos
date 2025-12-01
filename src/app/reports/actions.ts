
"use server";

import { generateBusinessReport } from "@/ai/flows/sales-reporting-tool";
import prisma from "@/lib/prisma";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getBusinessReport(userId: string, language: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const thirtyDaysAgo = subDays(new Date(), 30);

        const sales = await prisma.sale.findMany({
            where: { userId, saleDate: { gte: thirtyDaysAgo } },
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
             where: { userId, expenseDate: { gte: thirtyDaysAgo } },
             orderBy: { expenseDate: 'desc' }
        });

        const purchaseOrders = await prisma.purchaseOrder.findMany({
             where: { userId, orderDate: { gte: thirtyDaysAgo } },
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

        // Save the generated report to the database
        if (report.summary) {
            const reportTitle = `Business Report - ${new Date().toLocaleDateString()}`;
            await prisma.report.create({
                data: {
                    title: reportTitle,
                    content: report.summary,
                    userId: userId,
                }
            });
            revalidatePath('/reports/ai-history');
        }

        return report;

    } catch (error: any) {
        console.error("Failed to generate business report:", error);
        return { error: "Failed to generate business report. " + error.message };
    }
}

export async function getSalesHistory(userId: string, options: { dateFrom?: Date; dateTo?: Date; } = {}) {
    if (!userId) return { error: "User not authenticated" };
    const { dateFrom, dateTo } = options;
    try {
        const sales = await prisma.sale.findMany({
            where: {
                userId,
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

export async function getReportHistory(userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const reports = await prisma.report.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return { reports };
    } catch (error) {
        console.error("Failed to fetch report history:", error);
        return { error: "Failed to load report history." };
    }
}

export async function deleteReport(reportId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };
    try {
        const report = await prisma.report.findFirst({
            where: { id: reportId, userId }
        });

        if (!report) {
            return { error: "Report not found or access denied." };
        }

        await prisma.report.delete({
            where: { id: reportId }
        });
        revalidatePath('/reports/ai-history');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete report:", error);
        return { error: "Failed to delete report." };
    }
}


export async function deleteSale(saleId: string, userId: string) {
    if (!userId) return { error: "User not authenticated" };

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN') {
            return { error: "You are not authorized to perform this action." };
        }

        const sale = await prisma.sale.findFirst({
            where: { id: saleId, userId: userId },
            include: { items: true, customer: true }
        });

        if (!sale) {
            return { error: "Sale not found or you do not have permission to delete it." };
        }

        await prisma.$transaction(async (tx) => {
            // Restore product stock
            for (const item of sale.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }

            // If it was a credit sale, reverse the customer balance change
            if (sale.paymentType === 'CREDIT' && sale.customerId) {
                const debt = sale.totalAmount - sale.amountPaid;
                await tx.customer.update({
                    where: { id: sale.customerId },
                    data: { balance: { decrement: debt } }
                });
            }
            
            // Delete the sale itself
            await tx.sale.delete({ where: { id: saleId } });
        });

        revalidatePath('/reports/history');
        revalidatePath('/inventory');
        revalidatePath('/stats');
        if (sale.customerId) revalidatePath(`/customers/${sale.customerId}`);

        return { success: true };

    } catch (error: any) {
        console.error("Error deleting sale:", error);
        return { error: "Failed to delete sale. " + error.message };
    }
}
