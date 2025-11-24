"use server";

import prisma from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function getStatsData() {
  try {
    const totalRevenue = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const totalSales = await prisma.sale.count();

    const totalItemsSold = await prisma.saleItem.aggregate({
        _sum: {
            quantity: true,
        }
    });

    const today = startOfDay(new Date());
    const salesLast7Days = await Promise.all(
        Array.from({ length: 7 }).map(async (_, i) => {
            const date = subDays(today, i);
            const nextDate = subDays(today, i-1);

            const daySales = await prisma.sale.aggregate({
                _sum: {
                    totalAmount: true,
                },
                where: {
                    saleDate: {
                        gte: date,
                        lt: nextDate,
                    },
                },
            });
            return {
                date: date.toISOString().split("T")[0],
                total: daySales._sum.totalAmount || 0,
            };
        })
    );
    
    const topSellingProducts = await prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    });

    const productIds = topSellingProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true}
    });
    const productMap = new Map(products.map(p => [p.id, p.name]));

    const topProducts = topSellingProducts.map(item => ({
        name: productMap.get(item.productId) || 'Unknown',
        quantity: item._sum.quantity || 0,
    })).filter(p => p.quantity > 0);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalSales: totalSales || 0,
      totalItemsSold: totalItemsSold._sum.quantity || 0,
      salesLast7Days: salesLast7Days.reverse(),
      topProducts: topProducts,
    };
  } catch (error) {
    console.error("Failed to fetch stats data:", error);
    return {
      error: "Failed to load statistics.",
      totalRevenue: 0,
      totalSales: 0,
      totalItemsSold: 0,
      salesLast7Days: [],
      topProducts: [],
    };
  }
}
