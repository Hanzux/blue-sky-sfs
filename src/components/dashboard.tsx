
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Soup,
  Warehouse,
  ArrowUp,
  ArrowDown
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

const baseEnrollmentData = [
  { month: 'January', male: 80, female: 106 },
  { month: 'February', male: 150, female: 155 },
  { month: 'March', male: 110, female: 127 },
  { month: 'April', male: 80, female: 93 },
  { month: 'May', male: 100, female: 109 },
  { month: 'June', male: 104, female: 110 },
];

const baseAttendanceData = [
    { day: 'Mon', male: 89.1, female: 87.5 },
    { day: 'Tue', male: 92.3, female: 90.8 },
    { day: 'Wed', male: 94.0, female: 92.2 },
    { day: 'Thu', male: 91.5, female: 89.1 },
    { day: 'Fri', male: 95.2, female: 94.0 },
    { day: 'Sat', male: 93.1, female: 92.5 },
    { day: 'Sun', male: 90.4, female: 89.5 },
];

const baseMealsData = [
    { meal: 'Breakfast', servings: 1250, fill: 'var(--color-breakfast)' },
    { meal: 'Lunch', servings: 1181, fill: 'var(--color-lunch)' },
];

const LOW_STOCK_THRESHOLD = 30;

export function Dashboard() {
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');

  const [dashboardMetrics, setDashboardMetrics] = useState({
      totalLearners: 0,
      attendanceRate: 0,
      mealsServed: 0,
      lowStockItems: [] as typeof initialFoodItems,
  });

  const availableSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return ["All", ...initialSchools.map(s => s.name)];
    }
    const schoolsInDistrict = initialSchools.filter(s => s.district === filterDistrict).map(s => s.name);
    // Reset school filter when district changes if the school is not in the new district
    if (!schoolsInDistrict.includes(filterSchool)) {
        setFilterSchool('All');
    }
    return ["All", ...schoolsInDistrict];
  }, [filterDistrict, filterSchool]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    setFilterSchool('All'); // Reset school when district changes
  }
  
  const filteredData = useMemo(() => {
    const learners = initialLearners.filter(l => 
        (filterDistrict === 'All' || l.district === filterDistrict) && 
        (filterSchool === 'All' || l.school === filterSchool)
    );
    const foodItems = initialFoodItems.filter(item => 
        (filterDistrict === 'All' || item.district === filterDistrict) && 
        (filterSchool === 'All' || item.school === filterSchool)
    );

    return { learners, foodItems };
  }, [filterDistrict, filterSchool]);

  useEffect(() => {
    const totalLearners = filteredData.learners.length;
    const lowStockItems = filteredData.foodItems.filter(item => item.stock < LOW_STOCK_THRESHOLD);
    
    // Simulate metrics changing with filters
    const isFiltered = filterDistrict !== 'All' || filterSchool !== 'All';
    const attendanceRate = isFiltered ? (Math.random() * 5 + 90).toFixed(1) : 92.8;
    const mealsServed = isFiltered ? Math.floor(Math.random() * 500 + 2000) : 2431;

    setDashboardMetrics({
      totalLearners,
      attendanceRate: Number(attendanceRate),
      mealsServed,
      lowStockItems,
    });
  }, [filteredData, filterDistrict, filterSchool]);

  // Simulate chart data changing based on filters for a more dynamic feel
  const enrollmentData = useMemo(() => {
      if (filterDistrict === 'All' && filterSchool === 'All') return baseEnrollmentData;
      return baseEnrollmentData.map(d => ({
        ...d, 
        male: Math.floor(d.male * (Math.random() * 0.4 + 0.6)),
        female: Math.floor(d.female * (Math.random() * 0.4 + 0.6))
    }));
  }, [filterDistrict, filterSchool]);

  const attendanceData = useMemo(() => {
      if (filterDistrict === 'All' && filterSchool === 'All') return baseAttendanceData;
      return baseAttendanceData.map(d => ({
          ...d, 
          male: parseFloat((d.male * (Math.random() * 0.1 + 0.9)).toFixed(1)),
          female: parseFloat((d.female * (Math.random() * 0.1 + 0.9)).toFixed(1))
        }));
  }, [filterDistrict, filterSchool]);

  const mealsData = useMemo(() => {
    if (filterDistrict === 'All' && filterSchool === 'All') return baseMealsData;
    return baseMealsData.map(d => ({...d, servings: Math.floor(d.servings * (Math.random() * 0.4 + 0.6))}));
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
            <div className="text-2xl font-bold">{dashboardMetrics.totalLearners.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{dashboardMetrics.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {dashboardMetrics.attendanceRate > 92 ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              {Math.abs(dashboardMetrics.attendanceRate - 92.8).toFixed(1)}% from base
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
            <div className="text-2xl font-bold">{dashboardMetrics.mealsServed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Breakfast & Lunch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Warehouse className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{dashboardMetrics.lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground truncate">
                {dashboardMetrics.lowStockItems.length > 0 
                    ? dashboardMetrics.lowStockItems.map(i => i.name).join(', ') 
                    : 'All stock levels are good'
                }
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
              Attendance rate for the last 7 days by gender.
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
            <StockChart data={filteredData.foodItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
