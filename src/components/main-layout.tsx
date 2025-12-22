
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { CreditCard, FileText, LogOut, Settings, Package, BarChart, Truck, Users, User, History, Landmark, Bot, HomeIcon, ShoppingBag, Banknote, Wallet, FileStack, Contact, LayoutGrid, ShoppingCart, Folder, Wrench, PackagePlus, Telescope } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/hooks/use-translation";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { ThemeToggle } from "./theme-toggle";

const SidebarLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
        {children}
    </p>
);

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  };
  
  const getTrialStatus = () => {
      if (user?.subscriptionStatus === 'TRIAL' && user.trialEndsAt) {
          const daysLeft = differenceInDays(new Date(user.trialEndsAt), new Date());
          if (daysLeft > 0) {
              return `${daysLeft} trial days left`;
          } else if (daysLeft === 0) {
              return "Trial ends today";
          }
      }
      return null;
  }

  const trialStatus = getTrialStatus();
  const userRole = user?.role;

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarRail />
        <SidebarHeader>
            <Icons.logo className="h-20 w-20 self-center text-primary" />
        </SidebarHeader>
        <SidebarSeparator className="my-2" />

        <SidebarContent>
          <SidebarMenu>

             <SidebarLabel>Core</SidebarLabel>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/pos'} tooltip={t('sidebar.pos_screen')}>
                <Link href="/pos">
                  <ShoppingBag />
                  {t('sidebar.pos_screen')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/home'} tooltip={t('sidebar.dashboard')}>
                <Link href="/home">
                  <LayoutGrid />
                  {t('sidebar.dashboard')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator className="my-4" />

            <SidebarLabel>Management</SidebarLabel>
            {['ADMIN', 'CASHIER', 'PHONE_REPAIR'].includes(userRole || '') && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory')} tooltip={t('sidebar.inventory_management')}>
                  <Link href="/inventory">
                    <Package />
                    {t('sidebar.inventory_management')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {['ADMIN', 'CASHIER', 'PHONE_REPAIR'].includes(userRole || '') && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/customers')} tooltip={t('sidebar.customers_management')}>
                     <Link href="/customers">
                        <Users />
                        {t('sidebar.customers_management')}
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            
            {['PHONE_REPAIR'].includes(userRole || '') && (
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/repairs')} tooltip={t('sidebar.repairs')}>
                        <Link href="/repairs">
                        <Wrench />
                        {t('sidebar.repairs')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}

            {['ADMIN', 'CASHIER', 'PHONE_REPAIR'].includes(userRole || '') && (
              <>
                <SidebarSeparator className="my-4" />
                <SidebarLabel>{t('sidebar.purchases_management')}</SidebarLabel>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/suppliers')} tooltip={t('sidebar.suppliers')}>
                        <Link href="/suppliers">
                            <Truck />
                            {t('sidebar.suppliers')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/purchases')} tooltip={t('sidebar.direct_purchases')}>
                        <Link href="/purchases">
                            <PackagePlus />
                            {t('sidebar.direct_purchases')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            {['ADMIN', 'PHONE_REPAIR'].includes(userRole || '') && (
              <>
                <SidebarSeparator className="my-4" />
                <SidebarLabel>{t('sidebar.financial_management')}</SidebarLabel>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/income')} tooltip={t('sidebar.income')}>
                        <Link href="/income">
                        <Banknote />
                        {t('sidebar.income')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/expenses')} tooltip={t('sidebar.expenses')}>
                        <Link href="/expenses">
                        <Landmark />
                        {t('sidebar.expenses')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}

            <SidebarSeparator className="my-4" />

            <SidebarLabel>Analytics</SidebarLabel>
             {['ADMIN', 'PHONE_REPAIR'].includes(userRole || '') && (
                <>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/stats')} tooltip={t('sidebar.stats')}>
                        <Link href="/stats">
                        <BarChart />
                        {t('sidebar.stats')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/reports/history')} tooltip={t('sidebar.sales_history')}>
                        <Link href="/reports/history">
                            <History />
                            {t('sidebar.sales_history')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/reports'} tooltip={t('reports.ai_reports')}>
                        <Link href="/reports">
                            <Bot />
                            {t('reports.ai_reports')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </>
            )}
             {['ADMIN', 'CASHIER', 'PHONE_REPAIR'].includes(userRole || '') && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/product-discovery')} tooltip={t('home.links.product_discovery.title')}>
                  <Link href="/product-discovery">
                    <Telescope />
                    {t('home.links.product_discovery.title')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
             )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           {trialStatus && (
               <div className="p-2">
                   <Button variant="outline" className="w-full h-auto py-2" asChild>
                       <Link href="/billing">
                        <div className="flex flex-col items-center text-center">
                            <span className="text-xs font-semibold">{trialStatus}</span>
                            <span className="text-xs text-primary">Upgrade to Pro</span>
                        </div>
                       </Link>
                   </Button>
               </div>
           )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
          <SidebarTrigger/>
          <Breadcrumbs />
          <div className="flex-1 flex items-center justify-end gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-auto justify-start gap-2 p-1 h-auto rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-sm text-left overflow-hidden">
                      <span className="font-medium truncate">{user?.name || user?.email}</span>
                  </div>
                   {user?.subscriptionStatus === 'ACTIVE' && <Badge variant="secondary" className="text-green-500">PRO</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end">
                <DropdownMenuLabel>{t('user.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('user.profile')}</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('sidebar.settings')}</span>
                </DropdownMenuItem>
                {userRole === 'ADMIN' && (
                    <>
                    <DropdownMenuItem onClick={() => router.push('/settings/users')}>
                        <Contact className="mr-2 h-4 w-4" />
                        <span>{t('sidebar.staff_accounts')}</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => router.push('/settings/invoice')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Invoice Settings</span>
                    </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem onClick={() => router.push('/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('user.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
