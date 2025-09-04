'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Users,
  CalendarCheck,
  Soup,
  BarChart3,
  Package,
  Warehouse,
  Settings,
  CircleUser,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ReportingTool } from '@/components/reporting-tool';

const navItems = [
  { href: '#', icon: Home, label: 'Dashboard' },
  { href: '#', icon: Users, label: 'Learner Enrollment' },
  { href: '#', icon: CalendarCheck, label: 'Daily Attendance' },
  { href: '#', icon: Soup, label: 'Meal Recording' },
  { href: '#', icon: BarChart3, label: 'Reporting', badge: 'AI' },
  { href: '#', icon: Package, label: 'Food Items' },
  { href: '#', icon: Warehouse, label: 'Stock Tracking', alert: 3 },
];

export function Dashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <h2 className="text-lg font-semibold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Blue Sky
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.label === 'Dashboard'}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden bg-accent/20 text-accent">
                          {item.badge}
                        </Badge>
                      )}
                      {item.alert && (
                        <Badge variant="destructive" className="ml-auto group-data-[collapsible=icon]:hidden">
                          {item.alert}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-12 text-left group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                 <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person face" />
                                    <AvatarFallback>SH</AvatarFallback>
                                 </Avatar>
                                 <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                     <span className="text-sm font-medium">S. Headmaster</span>
                                     <span className="text-xs text-sidebar-foreground/70">head@school.org</span>
                                 </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                               <Link href="/">Logout</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Optional: Add search bar here */}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold md:text-2xl font-headline">
                Dashboard
              </h1>
            </div>
            <div
              className="grid flex-1 items-start gap-4 lg:gap-6"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,254</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">92.8%</div>
                    <p className="text-xs text-muted-foreground">+2.5% from yesterday</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meals Served Today</CardTitle>
                    <Soup className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,431</div>
                    <p className="text-xs text-muted-foreground">Breakfast & Lunch</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <Warehouse className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">3</div>
                    <p className="text-xs text-muted-foreground">Maize Meal, Salt, Beans</p>
                  </CardContent>
                </Card>
              </div>

              <ReportingTool />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
