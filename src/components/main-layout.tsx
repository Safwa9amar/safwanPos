
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
import { CreditCard, FileText, LogOut, Settings, Package, BarChart, Truck, Users, User, History, Landmark, Bot, HomeIcon, ShoppingCart, Banknote, Wallet, FileStack, Contact, LayoutGrid, ShoppingBag } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { cn } from "@/lib/utils";


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
            
            <Accordion type="multiple" className="w-full">
                {/* Inventory */}
                <AccordionItem value="inventory" className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline">
                        <Package className="h-4 w-4 mr-2" />
                        <span>{t('sidebar.inventory_management')}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-4">
                        <SidebarMenuItem>
                            <Link href="/inventory" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname === '/inventory' && "bg-sidebar-accent")}>{t('sidebar.inventory')}</Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/inventory/categories" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname === '/inventory/categories' && "bg-sidebar-accent")}>{t('sidebar.categories')}</Link>
                        </SidebarMenuItem>
                    </AccordionContent>
                </AccordionItem>

                {/* Sales Management */}
                <AccordionItem value="sales" className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline">
                        <ShoppingCart className="h-4 w-4 mr-2"/>
                        <span>{t('sidebar.sales_management')}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-4">
                         <SidebarMenuItem>
                            <Link href="/reports/history" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname.startsWith('/reports/history') && "bg-sidebar-accent")}>{t('sidebar.sales_history')}</Link>
                         </SidebarMenuItem>
                          <SidebarMenuItem>
                            <Link href="/stats" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname === '/stats' && "bg-sidebar-accent")}>{t('sidebar.stats')}</Link>
                         </SidebarMenuItem>
                         <SidebarMenuItem>
                            <Link href="/reports" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname === '/reports' && "bg-sidebar-accent")}>{t('reports.ai_reports')}</Link>
                         </SidebarMenuItem>
                    </AccordionContent>
                </AccordionItem>
                
                {/* Purchases Management */}
                <AccordionItem value="purchases" className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline">
                        <Truck className="h-4 w-4 mr-2"/>
                        <span>{t('sidebar.purchases_management')}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-4">
                        <SidebarMenuItem>
                            <Link href="/suppliers" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname.startsWith('/suppliers') && "bg-sidebar-accent")}>{t('sidebar.suppliers')}</Link>
                        </SidebarMenuItem>
                    </AccordionContent>
                </AccordionItem>

                {/* Customers Management */}
                <AccordionItem value="customers" className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline">
                        <Users className="h-4 w-4 mr-2"/>
                        <span>{t('sidebar.customers_management')}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-4">
                        <SidebarMenuItem>
                            <Link href="/customers" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname.startsWith('/customers') && "bg-sidebar-accent")}>{t('sidebar.customers')}</Link>
                        </SidebarMenuItem>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/settings/users')} tooltip={t('sidebar.staff_accounts')}>
                    <Link href="/settings/users">
                        <Contact />
                        {t('sidebar.staff_accounts')}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
             <Accordion type="multiple" className="w-full">
                {/* Shipping */}
                <AccordionItem value="shipping" className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline">
                        <Truck className="h-4 w-4 mr-2" />
                        <span>{t('sidebar.shipping_delivery')}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-4">
                        {/* Add shipping links here */}
                    </AccordionContent>
                </AccordionItem>
                {/* Financial */}
                 <AccordionItem value="financial" className="border-b-0">
                    <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline">
                        <Banknote className="h-4 w-4 mr-2" />
                        <span>{t('sidebar.financial_management')}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pl-4">
                        <SidebarMenuItem>
                            <Link href="/expenses" className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm", pathname.startsWith('/expenses') && "bg-sidebar-accent")}>{t('sidebar.expenses')}</Link>
                        </SidebarMenuItem>
                    </AccordionContent>
                </AccordionItem>
             </Accordion>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/billing')} tooltip={t('sidebar.payment_center')}>
                <Link href="/billing">
                  <Wallet />
                  {t('sidebar.payment_center')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>


          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/settings') && !pathname.startsWith('/settings/users')} tooltip={t('sidebar.settings')}>
                      <Link href="/settings">
                          <Settings />
                          {t('sidebar.settings')}
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
