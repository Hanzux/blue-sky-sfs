
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { initialLearners, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Users, UtensilsCrossed, Utensils, UserX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const mealTypes = ['Breakfast', 'Lunch', 'Snack'];

export default function MealRecordingPage() {
  const [filterDistrict, setFilterDistrict] = useState<string>(districts[1] || 'All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [mealDate, setMealDate] = useState<Date | undefined>(new Date());
  const [mealType, setMealType] = useState<string>(mealTypes[0]);
  const [mealRecords, setMealRecords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const availableSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return ["All", ...initialSchools.map(s => s.name)];
    }
    const schoolsInDistrict = initialSchools.filter(s => s.district === filterDistrict).map(s => s.name);
    if (!schoolsInDistrict.includes(filterSchool) || filterSchool === 'All') {
        setFilterSchool(schoolsInDistrict[0] || 'All');
    }
    return ["All", ...schoolsInDistrict];
  }, [filterDistrict, filterSchool]);

  const availableClasses = useMemo(() => {
    if (filterSchool === 'All') {
        setFilterClass('All');
        return ['All'];
    }
    const schoolLearners = initialLearners.filter(l => l.school === filterSchool);
    const classes = [...new Set(schoolLearners.map(l => l.className))];
    if (!classes.includes(filterClass)) {
        setFilterClass('All');
    }
    return ['All', ...classes];
  }, [filterSchool, filterClass]);

  const filteredLearners = useMemo(() => {
    if (filterSchool === 'All' || filterClass === 'All') return [];
    return initialLearners.filter(learner => learner.school === filterSchool && learner.className === filterClass);
  }, [filterSchool, filterClass]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    const schoolsInDistrict = initialSchools.filter(s => s.district === district).map(s => s.name);
    setFilterSchool(schoolsInDistrict[0] || 'All');
    setFilterClass('All');
    setMealRecords({});
  }

  const handleSchoolChange = (school: string) => {
    setFilterSchool(school);
    setFilterClass('All');
    setMealRecords({});
  }

  const handleClassChange = (className: string) => {
    setFilterClass(className);
    setMealRecords({});
  }
  
  const handleMealRecordChange = (learnerId: string, served: boolean) => {
    setMealRecords(prev => ({ ...prev, [learnerId]: served }));
  };
  
  const handleSelectAll = (checked: boolean) => {
    const newRecords: Record<string, boolean> = {};
    filteredLearners.forEach(learner => {
      newRecords[learner.id] = checked;
    });
    setMealRecords(newRecords);
  }

  const handleSave = () => {
    console.log({
      date: mealDate,
      district: filterDistrict,
      school: filterSchool,
      class: filterClass,
      mealType: mealType,
      records: mealRecords,
    });
    toast({
      title: 'Meal Records Saved',
      description: `${mealType} records for ${filterClass} at ${filterSchool} on ${mealDate?.toLocaleDateString()} have been saved.`,
    });
  }

  const stats = useMemo(() => {
    const total = filteredLearners.length;
    if (total === 0) return { served: 0, notServed: 0, total: 0, percentage: 0 };

    const servedCount = Object.values(mealRecords).filter(served => served).length;
    const notServedCount = total - servedCount;
    const percentage = total > 0 ? (servedCount / total) * 100 : 0;
    return { served: servedCount, notServed: notServedCount, total, percentage };
  }, [mealRecords, filteredLearners]);
  
  const allSelected = filteredLearners.length > 0 && Object.keys(mealRecords).length === filteredLearners.length && Object.values(mealRecords).every(r => r);


  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Learners in Class</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Total learners in the selected class</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meals Served ({mealType})</CardTitle>
                    <Utensils className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.served}</div>
                     <Progress value={stats.percentage} className="h-2 mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Serving Rate</CardTitle>
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.percentage.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Percentage of learners served</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Not Served</CardTitle>
                    <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.notServed}</div>
                    <p className="text-xs text-muted-foreground">Learners not served a meal</p>
                </CardContent>
            </Card>
        </div>


        <Card className="w-full">
        <CardHeader>
          <CardTitle>Meal Recording</CardTitle>
          <CardDescription>Record the meals served to learners each day.</CardDescription>
          <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
              <Select value={filterSchool} onValueChange={handleSchoolChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
                <Label>Class</Label>
                <Select value={filterClass} onValueChange={handleClassChange} disabled={filterSchool === 'All'}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                    type="date"
                    value={mealDate ? format(mealDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setMealDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
            </div>
            <div className="grid gap-2">
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Meal Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {mealTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner Name</TableHead>
                  <TableHead className='text-right flex items-center justify-end gap-2'>
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      aria-label="Select all learners"
                    />
                    <span>Served Meal</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLearners.length > 0 ? filteredLearners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell className="font-medium">{learner.name}</TableCell>
                    <TableCell className="text-right">
                      <Checkbox
                        checked={mealRecords[learner.id] || false}
                        onCheckedChange={(checked) => handleMealRecordChange(learner.id, checked as boolean)}
                        aria-label={`Mark ${learner.name} as served`}
                      />
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">
                            Select a school and class to record meals.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {filteredLearners.length > 0 && (
            <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                    <p><strong>Served:</strong> {stats.served}/{stats.total} ({stats.percentage.toFixed(1)}%)</p>
                </div>
                <Button onClick={handleSave}>Save Meal Records</Button>
            </CardFooter>
        )}
      </Card>
      </div>
    </div>
  );
}
