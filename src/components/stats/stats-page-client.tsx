"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BarChart, LineChart, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type StatsData = {
  totalRevenue: number;
  totalSales: number;
  totalItemsSold: number;
  salesLast7Days: { date: string; total: number }[];
  topProducts: { name: string; quantity: number }[];
  error?: string;
};

export function StatsPageClient({ initialStats }: { initialStats: StatsData }) {
  const { t } = useTranslation();

  if (initialStats.error) {
    return <div className="p-4">{initialStats.error}</div>;
  }

  const {
    totalRevenue,
    totalSales,
    totalItemsSold,
    salesLast7Days,
    topProducts,
  } = initialStats;
  
  const salesChartConfig = {
    total: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
  };
  
  const topProductsChartConfig = {
      quantity: {
          label: "Quantity Sold",
          color: "hsl(var(--chart-2))",
      },
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-3xl font-bold tracking-tight">{t('stats.title')}</CardTitle>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalSales')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalItemsSold')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalItemsSold}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('stats.salesLast7Days')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesLast7Days}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('stats.topSellingProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topProductsChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} layout="vertical" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
