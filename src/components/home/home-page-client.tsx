
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { 
    CreditCard, FileText, Package, BarChart, Truck, Users, Wrench, 
    History, Landmark, Bot, Telescope, Star, Search, HomeIcon, 
    Banknote, PackagePlus, LayoutGrid, ShoppingBag, DollarSign, TrendingUp, ShoppingCart
} from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/use-currency';
import { Button } from '../ui/button';

type LinkItem = {
  href: string;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  role: UserRole[];
  isNew?: boolean;
};

type LinkSection = {
  titleKey: string;
  links: LinkItem[];
};

const allSections: LinkSection[] = [
  {
    titleKey: 'sidebar.core',
    links: [
      { href: "/pos", icon: ShoppingBag, titleKey: "home.links.pos.title", descriptionKey: "home.links.pos.description", role: ['ADMIN', 'CASHIER', 'PHONE_REPAIR'] },
      { href: "/home", icon: LayoutGrid, titleKey: "sidebar.dashboard", descriptionKey: "home.links.dashboard.description", role: ['ADMIN', 'CASHIER', 'PHONE_REPAIR'] },
    ]
  },
  {
    titleKey: 'sidebar.management',
    links: [
      { href: "/inventory", icon: Package, titleKey: "home.links.inventory.title", descriptionKey: "home.links.inventory.description", role: ['ADMIN', 'CASHIER'] },
      { href: "/customers", icon: Users, titleKey: "home.links.customers.title", descriptionKey: "home.links.customers.description", role: ['ADMIN', 'CASHIER'] },
      { href: "/repairs", icon: Wrench, titleKey: "home.links.repairs.title", descriptionKey: "home.links.repairs.description", role: ['PHONE_REPAIR'] },
    ]
  },
   {
    titleKey: 'sidebar.purchases',
    links: [
        { href: "/suppliers", icon: Truck, titleKey: "home.links.suppliers.title", descriptionKey: "home.links.suppliers.description", role: ['ADMIN', 'CASHIER'] },
        { href: "/purchases", icon: PackagePlus, titleKey: "sidebar.direct_purchases", descriptionKey: "home.links.purchases.description", role: ['ADMIN', 'CASHIER'] },
    ]
  },
  {
    titleKey: 'sidebar.financial_management',
    links: [
       { href: "/income", icon: Banknote, titleKey: "sidebar.income", descriptionKey: "home.links.income.description", role: ['ADMIN'] },
       { href: "/expenses", icon: Landmark, titleKey: "home.links.expenses.title", descriptionKey: "home.links.expenses.description", role: ['ADMIN'] },
    ]
  },
  {
    titleKey: 'sidebar.analytics',
    links: [
      { href: "/stats", icon: BarChart, titleKey: "home.links.stats.title", descriptionKey: "home.links.stats.description", role: ['ADMIN'] },
      { href: "/reports/history", icon: History, titleKey: "home.links.sales_history.title", descriptionKey: "home.links.sales_history.description", role: ['ADMIN'] },
      { href: "/reports", icon: Bot, titleKey: "home.links.ai_reports.title", descriptionKey: "home.links.ai_reports.description", role: ['ADMIN'] },
      { href: "/product-discovery", icon: Telescope, titleKey: "home.links.product_discovery.title", descriptionKey: "home.links.product_discovery.description", role: ['ADMIN', 'CASHIER'], isNew: true },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

type TodayStats = {
  totalRevenue: number;
  totalSales: number;
  totalItemsSold: number;
  totalProfit: number;
}

export function HomePageClient({ todayStats }: { todayStats?: TodayStats }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');

  const availableSections = useMemo(() => {
    if (!user?.role) return [];

    return allSections
      .map(section => {
        const filteredLinks = section.links.filter(link => {
          if (!link.role.includes(user.role as UserRole)) {
            return false;
          }
          if (searchTerm) {
            const title = t(link.titleKey).toLowerCase();
            const description = t(link.descriptionKey).toLowerCase();
            return title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
          }
          return true;
        });

        return { ...section, links: filteredLinks };
      })
      .filter(section => section.links.length > 0);
  }, [user, searchTerm, t]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <HomeIcon className="h-8 w-8" />
              {t('home.title')}
          </CardTitle>
          <CardDescription>{t('home.description', { name: user?.name || 'User' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={t('home.searchPlaceholder')}
              className="pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {todayStats && (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Today's Snapshot</h2>
              <Button asChild variant="link">
                <Link href="/stats">Show more</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalRevenue')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(todayStats.totalRevenue)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", todayStats.totalProfit >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(todayStats.totalProfit)}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalSales')}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{todayStats.totalSales}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.totalItemsSold')}</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{todayStats.totalItemsSold}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

      {availableSections.map(section => (
        <motion.div 
            key={section.titleKey} 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold tracking-tight">{t(section.titleKey)}</motion.h2>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                variants={containerVariants}
            >
                {section.links.map(link => {
                    const Icon = link.icon;
                    const title = t(link.titleKey);
                    const description = t(link.descriptionKey);
                    return (
                        <motion.div key={link.href} variants={itemVariants}>
                            <Link href={link.href} passHref>
                                <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full flex flex-col relative bg-card/60 dark:bg-card/40 backdrop-blur-sm">
                                    {link.isNew && (
                                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                                            <Star className="h-4 w-4" />
                                        </div>
                                    )}
                                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                                        <div className="p-3 bg-background/70 rounded-lg">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">{title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <CardDescription>{description}</CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.div>
        </motion.div>
      ))}
      
      {availableSections.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-semibold">{t('home.noResults')}</p>
              <p>{t('home.noResultsDescription')}</p>
          </div>
      )}
    </div>
  );
}
