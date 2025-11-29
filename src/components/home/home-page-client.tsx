
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { 
    CreditCard, FileText, Package, BarChart, Truck, Users, Wrench, 
    History, Landmark, Bot, Telescope, Star, Search, HomeIcon, 
    Banknote, PackagePlus, LayoutGrid, ShoppingBag 
} from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';

type LinkItem = {
  href: string;
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  role: UserRole[];
  isNew?: boolean;
  colorClass: string;
};

type LinkSection = {
  titleKey: string;
  links: LinkItem[];
};

const allSections: LinkSection[] = [
  {
    titleKey: 'sidebar.core',
    links: [
      { href: "/pos", icon: ShoppingBag, titleKey: "home.links.pos.title", descriptionKey: "home.links.pos.description", role: ['ADMIN', 'CASHIER', 'PHONE_REPAIR'], colorClass: "bg-blue-100 dark:bg-blue-900/30" },
      { href: "/home", icon: LayoutGrid, titleKey: "sidebar.dashboard", descriptionKey: "home.links.dashboard.description", role: ['ADMIN', 'CASHIER', 'PHONE_REPAIR'], colorClass: "bg-green-100 dark:bg-green-900/30" },
    ]
  },
  {
    titleKey: 'sidebar.management',
    links: [
      { href: "/inventory", icon: Package, titleKey: "home.links.inventory.title", descriptionKey: "home.links.inventory.description", role: ['ADMIN', 'CASHIER'], colorClass: "bg-orange-100 dark:bg-orange-900/30" },
      { href: "/customers", icon: Users, titleKey: "home.links.customers.title", descriptionKey: "home.links.customers.description", role: ['ADMIN', 'CASHIER'], colorClass: "bg-purple-100 dark:bg-purple-900/30" },
      { href: "/repairs", icon: Wrench, titleKey: "home.links.repairs.title", descriptionKey: "home.links.repairs.description", role: ['PHONE_REPAIR'], colorClass: "bg-gray-200 dark:bg-gray-800/50" },
    ]
  },
   {
    titleKey: 'sidebar.purchases_management',
    links: [
        { href: "/suppliers", icon: Truck, titleKey: "home.links.suppliers.title", descriptionKey: "home.links.suppliers.description", role: ['ADMIN', 'CASHIER'], colorClass: "bg-yellow-100 dark:bg-yellow-900/30" },
        { href: "/purchases", icon: PackagePlus, titleKey: "sidebar.direct_purchases", descriptionKey: "home.links.purchases.description", role: ['ADMIN', 'CASHIER'], colorClass: "bg-teal-100 dark:bg-teal-900/30" },
    ]
  },
  {
    titleKey: 'sidebar.financial_management',
    links: [
       { href: "/income", icon: Banknote, titleKey: "sidebar.income", descriptionKey: "home.links.income.description", role: ['ADMIN'], colorClass: "bg-lime-100 dark:bg-lime-900/30" },
       { href: "/expenses", icon: Landmark, titleKey: "home.links.expenses.title", descriptionKey: "home.links.expenses.description", role: ['ADMIN'], colorClass: "bg-red-100 dark:bg-red-900/30" },
    ]
  },
  {
    titleKey: 'sidebar.analytics',
    links: [
      { href: "/stats", icon: BarChart, titleKey: "home.links.stats.title", descriptionKey: "home.links.stats.description", role: ['ADMIN'], colorClass: "bg-cyan-100 dark:bg-cyan-900/30" },
      { href: "/reports/history", icon: History, titleKey: "home.links.sales_history.title", descriptionKey: "home.links.sales_history.description", role: ['ADMIN'], colorClass: "bg-indigo-100 dark:bg-indigo-900/30" },
      { href: "/reports", icon: Bot, titleKey: "home.links.ai_reports.title", descriptionKey: "home.links.ai_reports.description", role: ['ADMIN'], colorClass: "bg-pink-100 dark:bg-pink-900/30" },
      { href: "/product-discovery", icon: Telescope, titleKey: "home.links.product_discovery.title", descriptionKey: "home.links.product_discovery.description", role: ['ADMIN', 'CASHIER'], isNew: true, colorClass: "bg-amber-100 dark:bg-amber-900/30" },
    ]
  }
];


export function HomePageClient() {
  const { t } = useTranslation();
  const { user } = useAuth();
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
      <Card className="bg-card/50 backdrop-blur-sm">
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
      
      {availableSections.map(section => (
        <div key={section.titleKey} className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t(section.titleKey)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.links.map(link => {
                    const Icon = link.icon;
                    const title = t(link.titleKey);
                    const description = t(link.descriptionKey);
                    return (
                        <Link href={link.href} key={link.href} passHref>
                            <Card className={cn("hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full flex flex-col relative backdrop-blur-sm", link.colorClass)}>
                                {link.isNew && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                                        <Star className="h-4 w-4" />
                                    </div>
                                )}
                                <CardHeader className="flex-row items-center gap-4 space-y-0">
                                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{description}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
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
