
'use client';

import {
  Users,
  CalendarCheck,
  Soup,
  Warehouse,
  ArrowUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  AttendanceChart,
  EnrollmentChart,
  MealsChart,
  StockChart,
} from '@/components/charts';

export function Dashboard() {
  return (
    <div className="grid flex-1 items-start gap-4 lg:gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.8%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              2.5% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meals Served Today
            </CardTitle>
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
            <p className="text-xs text-muted-foreground">
              Maize Meal, Salt, Beans
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Learner Enrollment Trends</CardTitle>
            <CardDescription>
              Monthly new learner enrollments for the current year.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <EnrollmentChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>
              Attendance rate for the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Meal Recording</CardTitle>
            <CardDescription>
              Breakdown of meals served today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MealsChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock Tracking</CardTitle>
            <CardDescription>
              Current stock levels for key food items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
