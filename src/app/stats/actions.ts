
"use server";

import prisma from "@/lib/prisma";
import { startOfDay, subDays, endOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

type DateRange = { from: Date; to: Date };

export async function getStatsData(dateRange?: DateRange) {
  try {
    const whereClause = dateRange
      ? {
          saleDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }
      : {};

    const totalRevenue = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: whereClause,
    });

    const totalSales = await prisma.sale.count({
      where: whereClause,
    });

    const totalItemsSold = await prisma.saleItem.aggregate({
        _sum: {
            quantity: true,
        },
        where: {
            sale: whereClause
        }
    });
    
    // The sales over time chart will be dynamic based on the range.
    // For this implementation, we will keep it simple and just fetch sales from the period.
    const salesOverTime = await prisma.sale.findMany({
        where: whereClause,
        select: {
            saleDate: true,
            totalAmount: true,
        },
        orderBy: {
            saleDate: 'asc'
        }
    });

    // Group sales by day
    const dailySales = salesOverTime.reduce((acc, sale) => {
        const date = sale.saleDate.toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += sale.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    const salesChartData = Object.entries(dailySales).map(([date, total]) => ({
        date,
        total,
    }));


    const topSellingProducts = await prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true
        },
        where: {
            sale: whereClause,
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
      salesChartData: salesChartData,
      topProducts: topProducts,
    };
  } catch (error) {
    console.error("Failed to fetch stats data:", error);
    return {
      error: "Failed to load statistics.",
      totalRevenue: 0,
      totalSales: 0,
      totalItemsSold: 0,
      salesChartData: [],
      topProducts: [],
    };
  }
}
