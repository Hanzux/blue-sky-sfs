
'use client';

import { usePathname } from 'next/navigation';
import {
  Users,
  CalendarCheck,
  Soup,
  Warehouse,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { ReportingTool } from '@/components/reporting-tool';
import AdminUsersPage from '@/app/admin/users/page';


export function Dashboard() {
  const pathname = usePathname();

  const renderContent = () => {
    switch (pathname) {
      case '/dashboard':
        return (
          <>
            <div className="flex items-center">
              <h1 className="text-lg font-semibold md:text-2xl font-headline">
                Dashboard
              </h1>
            </div>
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
        return (
          <>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">
                    Reporting
                </h1>
            </div>
            <ReportingTool />
          </>
        );
        case '/admin/users':
            return (
                <AdminUsersPage />
            )
      default:
        return null;
    }
  };


  return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {renderContent()}
        </main>
      </div>
  );
}
