
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  Soup,
  Warehouse,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { ReportingTool } from '@/components/reporting-tool';
import AdminUsersPage from '@/app/admin/users/page';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { navItems, adminNavItems } from '@/lib/nav-items';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import LearnerEnrollmentPage from '@/app/dashboard/learner-enrollment/page';
import DailyAttendancePage from '@/app/dashboard/daily-attendance/page';
import MealRecordingPage from '@/app/dashboard/meal-recording/page';
import FoodItemsPage from '@/app/dashboard/food-items/page';

export function Dashboard() {
  const pathname = usePathname();

  const renderContent = () => {
    switch (pathname) {
      case '/dashboard':
        return (
          <>
            <div
              className="grid flex-1 items-start gap-4 lg:gap-6"
            >
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
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
            </div>
          </>
        );
      case '/dashboard/reporting':
        return <ReportingTool />;
      case '/dashboard/learner-enrollment':
        return <LearnerEnrollmentPage />;
      case '/dashboard/daily-attendance':
        return <DailyAttendancePage />;
      case '/dashboard/meal-recording':
        return <MealRecordingPage />;
      case '/dashboard/food-items':
        return <FoodItemsPage />;
      case '/admin/users':
        return <AdminUsersPage />;
      default:
        // You can decide what to render for other routes, e.g., a "Not Found" message
        if (navItems.some(item => item.href === pathname && item.href !== '#')) {
            return <div>This is the page for {pathname}</div>;
        }
        return <p>Page not found or not yet implemented.</p>;
    }
  };
  
  const getActiveTab = () => {
    if (pathname.startsWith('/admin')) {
        return 'admin';
    }
    return pathname;
  }


  return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className='mb-4'>
                    <Tabs value={getActiveTab()} className="w-full">
                        <div className="flex items-center">
                            <TabsList className='hidden md:inline-flex'>
                                {navItems.map(item => (
                                    <TabsTrigger key={item.label} value={item.href} asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </TabsTrigger>
                                ))}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <TabsTrigger value="admin" className={cn(pathname.startsWith('/admin') && 'bg-background text-foreground shadow-sm')}>System Admin</TabsTrigger>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {adminNavItems.map(item => (
                                            <DropdownMenuItem key={item.label} asChild>
                                                <Link href={item.href}>
                                                    {item.label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>
                {renderContent()}
            </main>
        </div>
      </div>
  );
}
