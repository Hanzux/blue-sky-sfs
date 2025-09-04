
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
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

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

  const getMealStats = () => {
    const total = filteredLearners.length;
    if (total === 0) return { served: 0, total: 0, percentage: '0.00' };

    const servedCount = Object.values(mealRecords).filter(served => served).length;
    const percentage = total > 0 ? ((servedCount / total) * 100).toFixed(2) : '0.00';
    return { served: servedCount, total, percentage };
  }
  
  const stats = getMealStats();
  const allSelected = filteredLearners.length > 0 && Object.keys(mealRecords).length === filteredLearners.length && Object.values(mealRecords).every(r => r);


  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-6xl">
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
                <DatePicker date={mealDate} onDateChange={setMealDate} />
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
                    <p><strong>Served:</strong> {stats.served}/{stats.total} ({stats.percentage}%)</p>
                </div>
                <Button onClick={handleSave}>Save Meal Records</Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

