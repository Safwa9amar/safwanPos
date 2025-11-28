"use server";

import prisma from "@/lib/prisma";
import { startOfDay, subDays, endOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

type DateRange = { from: Date; to: Date };

export async function getStatsData(userId: string, dateRange?: DateRange) {
  if (!userId) return { error: "User not authenticated", totalRevenue:0, totalSales:0, totalItemsSold:0, salesChartData:[], topProducts:[], totalSuppliers:0, totalPurchaseOrders:0, totalPOCost:0, topSuppliers:[] };
  try {
    const baseWhere = { userId };
    const saleWhereClause = dateRange
      ? {
          ...baseWhere,
          saleDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }
      : baseWhere;
    
    const poWhereClause = dateRange
      ? {
          ...baseWhere,
          orderDate: {
              gte: dateRange.from,
              lte: dateRange.to,
          }
      } : baseWhere;

    const totalRevenue = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: saleWhereClause,
    });

    const totalSales = await prisma.sale.count({
      where: saleWhereClause,
    });

    const totalItemsSold = await prisma.saleItem.aggregate({
        _sum: {
            quantity: true,
        },
        where: {
            sale: saleWhereClause
        }
    });
    
    const salesOverTime = await prisma.sale.findMany({
        where: saleWhereClause,
        select: {
            saleDate: true,
            totalAmount: true,
        },
        orderBy: {
            saleDate: 'asc'
        }
    });

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
            sale: saleWhereClause,
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
        where: { id: { in: productIds }, userId },
        select: { id: true, name: true}
    });
    const productMap = new Map(products.map(p => [p.id, p.name]));

    const topProducts = topSellingProducts.map(item => ({
        name: productMap.get(item.productId) || 'Unknown',
        quantity: item._sum.quantity || 0,
    })).filter(p => p.quantity > 0);

    // --- Supplier & Purchase Order Stats ---
    const totalSuppliers = await prisma.supplier.count({ where: { userId }});

    const poStats = await prisma.purchaseOrder.aggregate({
        _count: { id: true },
        _sum: { totalCost: true },
        where: poWhereClause
    });

    const topSuppliersByValue = await prisma.purchaseOrder.groupBy({
        by: ['supplierId'],
        _sum: {
            totalCost: true
        },
        where: poWhereClause,
        orderBy: {
            _sum: {
                totalCost: 'desc'
            }
        },
        take: 5
    });

    const supplierIds = topSuppliersByValue.map(s => s.supplierId).filter(Boolean) as string[];
    const suppliers = await prisma.supplier.findMany({
        where: { id: { in: supplierIds }, userId },
        select: { id: true, name: true }
    });
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

    const topSuppliersData = topSuppliersByValue.map(item => ({
        name: item.supplierId ? supplierMap.get(item.supplierId) || 'Unknown' : 'Unknown',
        total: item._sum.totalCost || 0,
    })).filter(s => s.total > 0);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalSales: totalSales || 0,
      totalItemsSold: totalItemsSold._sum.quantity || 0,
      salesChartData: salesChartData,
      topProducts: topProducts,
      totalSuppliers,
      totalPurchaseOrders: poStats._count.id || 0,
      totalPOCost: poStats._sum.totalCost || 0,
      topSuppliers: topSuppliersData,
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
      totalSuppliers: 0,
      totalPurchaseOrders: 0,
      totalPOCost: 0,
      topSuppliers: [],
    };
  }
}
