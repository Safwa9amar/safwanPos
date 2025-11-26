
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
import { CreditCard, FileText, LogOut, Settings, Package, BarChart, Truck, Users, Wrench, User, History, Landmark, Bot, Telescope } from "lucide-react";
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

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarRail />
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="size-8 text-primary" />
            <span className="text-lg font-semibold">SafwanPOS</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Storefront</div>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/pos'} tooltip={t('sidebar.pos')}>
                <Link href="/pos">
                  <CreditCard />
                  {t('sidebar.pos')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarSeparator className="my-2" />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Management</div>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory')} tooltip={t('sidebar.inventory')}>
                <Link href="/inventory">
                  <Package />
                  {t('sidebar.inventory')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/product-discovery')} tooltip={'Product Discovery'}>
                <Link href="/product-discovery">
                  <Telescope />
                  {'Product Discovery'}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/repairs')} tooltip={t('sidebar.repairs')}>
                <Link href="/repairs">
                  <Wrench />
                  {t('sidebar.repairs')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/suppliers')} tooltip={t('sidebar.suppliers')}>
                <Link href="/suppliers">
                  <Truck />
                  {t('sidebar.suppliers')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/customers')} tooltip={t('sidebar.customers')}>
                <Link href="/customers">
                  <Users />
                  {t('sidebar.customers')}
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
            
            <SidebarSeparator className="my-2" />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Analytics</div>

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
                  <FileText />
                  {t('reports.ai_reports')}
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
              <SidebarMenuButton asChild isActive={pathname.startsWith('/reports/ai-history')} tooltip={t('reports.history.title')}>
                 <Link href="/reports/ai-history">
                    <Bot />
                    {t('reports.history.title')}
                 </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')} tooltip={t('sidebar.settings')}>
                      <Link href="/settings">
                          <Settings />
                          {t('sidebar.settings')}
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                <Avatar className="h-8 w-8">
                  {/* <AvatarImage src={user?.photoURL || undefined} /> */}
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm text-left overflow-hidden">
                    <span className="font-medium truncate">{user?.name || user?.email}</span>
                    <span className="text-muted-foreground text-xs">{user?.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
              <DropdownMenuLabel>{t('user.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>{t('user.profile')}</span>
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
             {/* You can add a page title here if needed */}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
