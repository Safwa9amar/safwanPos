
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { BarChart as BarChartIcon, ShoppingCart, DollarSign, TrendingUp, Loader2, Truck, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getStatsData } from "@/app/stats/actions";
import { startOfDay, subDays, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfMonth, endOfYear } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { Separator } from "../ui/separator";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type StatsData = {
  totalRevenue: number;
  totalSales: number;
  totalItemsSold: number;
  totalProfit: number;
  salesChartData: { date: string; total: number }[];
  topProducts: { name: string; quantity: number }[];
  totalSuppliers: number;
  totalPurchaseOrders: number;
  totalPOCost: number;
  topSuppliers: { name: string; total: number }[];
  error?: string;
};

const dateRanges = {
    'today': { name: 'Today', from: startOfDay(new Date()), to: endOfDay(new Date()) },
    '7d': { name: 'Last 7 days', from: subDays(startOfDay(new Date()), 6), to: endOfDay(new Date()) },
    '30d': { name: 'Last 30 days', from: subDays(startOfDay(new Date()), 29), to: endOfDay(new Date()) },
    'this-month': { name: 'This Month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    'this-year': { name: 'This Year', from: startOfYear(new Date()), to: endOfYear(new Date()) },
};

export function StatsPageClient() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<string>('7d');

  useEffect(() => {
    if (user) {
        const fetchStats = async (rangeKey: string) => {
            setIsLoading(true);
            const range = dateRanges[rangeKey as keyof typeof dateRanges];
            const data = await getStatsData(user.id, range);
            setStats(data);
            setIsLoading(false);
        };
        fetchStats(selectedRange);
    }
  }, [selectedRange, user]);

  if (isLoading || !stats) {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (stats.error) {
    return <div className="p-4">{stats.error}</div>;
  }

  const {
    totalRevenue,
    totalSales,
    totalItemsSold,
    totalProfit,
    salesChartData,
    topProducts,
    totalSuppliers,
    totalPurchaseOrders,
    totalPOCost,
    topSuppliers,
  } = stats;
  
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
  
  const topSuppliersChartConfig = {
      total: {
          label: "Total Value",
          color: "hsl(var(--chart-3))",
      }
  }

  const salesTickFormatter = (value: string) => {
    const date = new Date(value);
    const rangeKey = selectedRange;
    if (rangeKey === 'this-year') return date.toLocaleDateString('en-US', { month: 'short' });
    if (rangeKey === '30d' || rangeKey === 'this-month') return date.toLocaleDateString('en-US', { day: 'numeric' });
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl font-bold tracking-tight">{t('stats.title')}</CardTitle>
          <CardDescription>View sales and purchasing statistics for different periods.</CardDescription>
        </CardHeader>
        <div className="flex items-center gap-2">
            <Select value={selectedRange} onValueChange={setSelectedRange} disabled={isLoading}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(dateRanges).map(([key, {name}]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", totalProfit >= 0 ? "text-green-600" : "text-red-600")}>
                {formatCurrency(totalProfit)}
            </div>
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
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalItemsSold}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={salesTickFormatter}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value as number, { notation: 'compact' })} />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value, name, props) => {
                      return (
                        <div className="flex flex-col">
                            <span>{props.payload.date}</span>
                            <span className="font-bold">{formatCurrency(value as number)}</span>
                        </div>
                      )
                  }} />} />
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
                        <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} layout="vertical" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <Separator className="my-6" />
        <h3 className="text-2xl font-bold tracking-tight mb-4">Purchasing Stats</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalPurchaseOrders}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PO Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPOCost)}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Top Suppliers by Purchase Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topSuppliersChartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSuppliers} layout="vertical">
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value as number, { notation: 'compact' })}/>
                        <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => formatCurrency(value as number)} />} />
                        <Bar dataKey="total" fill="var(--color-total)" radius={4} layout="vertical" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
