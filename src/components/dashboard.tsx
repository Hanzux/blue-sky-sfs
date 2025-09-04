
'use client';

import { useState, useMemo } from 'react';
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
import { initialSchools, initialLearners, initialFoodItems } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];

const enrollmentData = [
  { month: 'January', learners: 186 },
  { month: 'February', learners: 305 },
  { month: 'March', learners: 237 },
  { month: 'April', learners: 173 },
  { month: 'May', learners: 209 },
  { month: 'June', learners: 214 },
];

const attendanceData = [
    { day: 'Mon', rate: 88.2 },
    { day: 'Tue', rate: 91.5 },
    { day: 'Wed', rate: 93.1 },
    { day: 'Thu', rate: 90.3 },
    { day: 'Fri', rate: 94.6 },
    { day: 'Sat', rate: 92.8 },
    { day: 'Sun', rate: 89.9 },
];

const mealsData = [
    { meal: 'Breakfast', servings: 1250, fill: 'var(--color-breakfast)' },
    { meal: 'Lunch', servings: 1181, fill: 'var(--color-lunch)' },
];

export function Dashboard() {
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');

  const availableSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return ["All", ...initialSchools.map(s => s.name)];
    }
    const schoolsInDistrict = initialSchools.filter(s => s.district === filterDistrict).map(s => s.name);
    setFilterSchool(schoolsInDistrict[0] || 'All');
    return ["All", ...schoolsInDistrict];
  }, [filterDistrict]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    setFilterSchool('All');
  }

  const stockData = useMemo(() => {
    return initialFoodItems.filter(item => {
        const districtMatch = filterDistrict === 'All' || item.district === filterDistrict;
        const schoolMatch = filterSchool === 'All' || item.school === filterSchool;
        return districtMatch && schoolMatch;
    });
  }, [filterDistrict, filterSchool]);

  return (
    <div className="grid flex-1 items-start gap-4 lg:gap-6">
        <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>District</Label>
              <Select value={filterDistrict} onValueChange={handleDistrictChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>School</Label>
              <Select value={filterSchool} onValueChange={setFilterSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
        </div>
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
            <EnrollmentChart data={enrollmentData} />
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
            <AttendanceChart data={attendanceData} />
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
            <MealsChart data={mealsData}/>
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
            <StockChart data={stockData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
