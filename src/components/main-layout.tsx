
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
import { CreditCard, FileText, LogOut, Settings, Package, BarChart, Truck, Users, User, History, Landmark, Bot, HomeIcon, ShoppingCart, Banknote, Wallet, FileStack, Contact, LayoutGrid, ShoppingBag, Folder, Wrench } from "lucide-react";
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
import { UserRole } from "@prisma/client";

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
  const isAdmin = user?.role === UserRole.ADMIN;

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
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory')} tooltip={t('sidebar.inventory_management')}>
                <Link href="/inventory">
                  <Package />
                  {t('sidebar.inventory_management')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/suppliers')} tooltip={t('sidebar.purchases_management')}>
                    <Link href="/suppliers">
                        <Truck />
                        {t('sidebar.purchases_management')}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/customers')} tooltip={t('sidebar.customers_management')}>
                     <Link href="/customers">
                        <Users />
                        {t('sidebar.customers_management')}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isAdmin && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/expenses')} tooltip={t('sidebar.expenses')}>
                        <Link href="/expenses">
                        <Landmark />
                        {t('sidebar.expenses')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}

            {isAdmin && (
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/repairs')} tooltip={t('sidebar.repairs')}>
                        <Link href="/repairs">
                        <Wrench />
                        {t('sidebar.repairs')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}

            <SidebarSeparator className="my-4" />

            <SidebarLabel>Analytics</SidebarLabel>
             {isAdmin && (
                <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/reports/history')} tooltip={t('sidebar.sales_history')}>
                        <Link href="/reports/history">
                            <History />
                            {t('sidebar.sales_history')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/stats'} tooltip={t('sidebar.stats')}>
                        <Link href="/stats">
                            <BarChart />
                            {t('sidebar.stats')}
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
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/product-discovery')} tooltip={t('home.links.product_discovery.title')}>
                <Link href="/product-discovery">
                  <Package />
                  {t('home.links.product_discovery.title')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>


          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             {isAdmin && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/settings/users')} tooltip={t('sidebar.staff_accounts')}>
                        <Link href="/settings/users">
                            <Contact />
                            {t('sidebar.staff_accounts')}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             )}
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/settings') && !pathname.startsWith('/settings/users')} tooltip={t('sidebar.settings')}>
                      <Link href="/settings">
                          <Settings />
                          {t('sidebar.settings')}
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/billing')} tooltip={t('sidebar.payment_center')}>
                    <Link href="/billing">
                    <Wallet />
                    {t('sidebar.payment_center')}
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
           </SidebarMenu>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm text-left overflow-hidden">
                    <span className="font-medium truncate">{user?.name || user?.email}</span>
                    <span className="text-muted-foreground text-xs">{user?.role}</span>
                </div>
                 {user?.subscriptionStatus === 'ACTIVE' && <Badge variant="secondary" className="ml-auto text-green-500">PRO</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
              <DropdownMenuLabel>{t('user.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>{t('user.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('user.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
          <SidebarTrigger/>
          <div className="flex-1">
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
