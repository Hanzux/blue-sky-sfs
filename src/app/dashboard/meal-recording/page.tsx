
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Users, UtensilsCrossed, Utensils, UserX, MoreHorizontal, FileDown, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuditLog } from '@/contexts/audit-log-context';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const mealTypes = ['Breakfast', 'Lunch', 'Snack'];
const SAVED_ITEMS_PER_PAGE = 5;

type MealStats = {
    served: number;
    notServed: number;
    total: number;
    percentage: number;
};

type SavedMealRecord = {
    id: string;
    date: Date;
    district: string;
    school: string;
    class: string;
    mealType: string;
    records: Record<string, boolean>;
    stats: MealStats;
}

export default function MealRecordingPage() {
  const [filterDistrict, setFilterDistrict] = useState<string>(districts[1] || 'All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [mealDate, setMealDate] = useState<Date | undefined>(new Date());
  const [mealType, setMealType] = useState<string>(mealTypes[0]);
  const [mealRecords, setMealRecords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();
  
  const [savedMealRecords, setSavedMealRecords] = useState<SavedMealRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<SavedMealRecord | null>(null);

  const [savedFilterDistrict, setSavedFilterDistrict] = useState<string>('All');
  const [savedFilterSchool, setSavedFilterSchool] = useState<string>('All');

  useEffect(() => {
    const storedRecords = localStorage.getItem('savedMealRecords');
    if (storedRecords) {
        try {
            const parsedRecords = JSON.parse(storedRecords).map((rec: any) => ({...rec, date: new Date(rec.date)}));
            setSavedMealRecords(parsedRecords);
        } catch (error) {
            console.error("Failed to parse saved meal records from localStorage", error);
        }
    }
  }, []);

  useEffect(() => {
      if (savedMealRecords.length > 0) {
        localStorage.setItem('savedMealRecords', JSON.stringify(savedMealRecords));
      }
  }, [savedMealRecords]);

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

  useEffect(() => {
    const initialRecords: Record<string, boolean> = {};
    filteredLearners.forEach(learner => {
        initialRecords[learner.id] = false; // Default to 'Not Served'
    });
    setMealRecords(initialRecords);
  }, [filteredLearners]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    const schoolsInDistrict = initialSchools.filter(s => s.district === district).map(s => s.name);
    setFilterSchool(schoolsInDistrict[0] || 'All');
    setFilterClass('All');
  }

  const handleSchoolChange = (school: string) => {
    setFilterSchool(school);
    setFilterClass('All');
  }

  const handleClassChange = (className: string) => {
    setFilterClass(className);
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
  
  const stats: MealStats = useMemo(() => {
    const total = filteredLearners.length;
    if (total === 0) return { served: 0, notServed: 0, total: 0, percentage: 0 };

    const servedCount = Object.values(mealRecords).filter(served => served).length;
    const notServedCount = total - servedCount;
    const percentage = total > 0 ? (servedCount / total) * 100 : 0;
    return { served: servedCount, notServed: notServedCount, total, percentage };
  }, [mealRecords, filteredLearners]);

  const handleSave = () => {
    if (!mealDate || filteredLearners.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Cannot Save',
            description: 'Please ensure you have selected a class to record meals.',
        });
        return;
    }

    const newRecord: SavedMealRecord = {
        id: new Date().toISOString(),
        date: mealDate,
        district: filterDistrict,
        school: filterSchool,
        class: filterClass,
        mealType: mealType,
        records: { ...mealRecords },
        stats: { ...stats }
    };
    
    setSavedMealRecords(prev => [newRecord, ...prev]);

    const description = `${mealType} records for ${filterClass} at ${filterSchool} on ${mealDate?.toLocaleDateString()} have been saved.`;
    toast({
      title: 'Meal Records Saved',
      description,
    });
    addAuditLog({ action: 'Meal Recorded', details: `Recorded ${mealType} for ${stats.total} learners in ${filterClass} at ${filterSchool}` });
  }

  const handleViewRecord = (record: SavedMealRecord) => {
    setViewingRecord(record);
    setIsViewDialogOpen(true);
  }

  const handleExportPdf = (record: SavedMealRecord) => {
    const doc = new jsPDF();
    const learnersInRecord = initialLearners.filter(l => record.records.hasOwnProperty(l.id));
    const notServedLearners = learnersInRecord.filter(l => !record.records[l.id]);

    doc.setFontSize(18);
    doc.text(`${record.mealType} Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`School: ${record.school}`, 14, 30);
    doc.text(`Class: ${record.class}`, 14, 36);
    doc.text(`Date: ${record.date.toLocaleDateString()}`, 14, 42);

    (doc as any).autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
            ['Total Learners', record.stats.total],
            ['Meals Served', record.stats.served],
            ['Meals Not Served', record.stats.notServed],
            ['Service Rate', `${record.stats.percentage.toFixed(1)}%`],
        ],
        theme: 'grid'
    });
    
    let finalY = (doc as any).lastAutoTable.finalY;

    if (notServedLearners.length > 0) {
        (doc as any).autoTable({
            startY: finalY + 10,
            head: [['Learners Not Served']],
            body: notServedLearners.map(learner => [learner.name]),
        });
        finalY = (doc as any).lastAutoTable.finalY;
    }

    (doc as any).autoTable({
        startY: finalY + 10,
        head: [['All Learners', 'Status']],
        body: learnersInRecord.map(learner => [
            learner.name,
            record.records[learner.id] ? 'Served' : 'Not Served'
        ]),
    });
    
    doc.save(`meals_${record.school}_${record.class}_${record.date.toISOString().split('T')[0]}.pdf`);
    addAuditLog({ action: 'Meal Record Exported', details: `Exported PDF for ${record.mealType} at ${record.school}` });
  }

  const filteredSavedMealRecords = useMemo(() => {
    return savedMealRecords.filter(record => {
      const districtMatch = savedFilterDistrict === 'All' || record.district === savedFilterDistrict;
      const schoolMatch = savedFilterSchool === 'All' || record.school === savedFilterSchool;
      return districtMatch && schoolMatch;
    });
  }, [savedMealRecords, savedFilterDistrict, savedFilterSchool]);

  const paginatedSavedMealRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * SAVED_ITEMS_PER_PAGE;
    const endIndex = startIndex + SAVED_ITEMS_PER_PAGE;
    return filteredSavedMealRecords.slice(startIndex, endIndex);
  }, [filteredSavedMealRecords, currentPage]);

  const totalPages = Math.ceil(filteredSavedMealRecords.length / SAVED_ITEMS_PER_PAGE);

  const availableSavedSchools = useMemo(() => {
    if (savedFilterDistrict === 'All') {
      return ["All", ...new Set(savedMealRecords.map(s => s.school))];
    }
    const schoolsInDistrict = [...new Set(savedMealRecords.filter(s => s.district === savedFilterDistrict).map(s => s.school))];
    return ["All", ...schoolsInDistrict];
  }, [savedFilterDistrict, savedMealRecords]);

  const handleSavedDistrictChange = (district: string) => {
    setSavedFilterDistrict(district);
    setSavedFilterSchool('All');
    setCurrentPage(1);
  }

  const handleSavedSchoolChange = (school: string) => {
    setSavedFilterSchool(school);
    setCurrentPage(1);
  }
  
  const allSelected = useMemo(() => {
    if (filteredLearners.length === 0) return false;
    return filteredLearners.every(learner => mealRecords[learner.id]);
  }, [mealRecords, filteredLearners]);


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
                      disabled={filteredLearners.length === 0}
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
                    <p><strong>Not Served:</strong> {stats.notServed}</p>
                </div>
                <Button onClick={handleSave}>Save Meal Records</Button>
            </CardFooter>
        )}
      </Card>

       {savedMealRecords.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Saved Meal Records</CardTitle>
                    <CardDescription>View and export previously saved meal records.</CardDescription>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Filter by District</Label>
                            <Select value={savedFilterDistrict} onValueChange={handleSavedDistrictChange}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                                <SelectContent>
                                {["All", ...new Set(savedMealRecords.map(r => r.district))].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Filter by School</Label>
                            <Select value={savedFilterSchool} onValueChange={handleSavedSchoolChange} disabled={savedFilterDistrict === 'All'}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select School" />
                                </SelectTrigger>
                                <SelectContent>
                                {availableSavedSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>School</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Meal Type</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSavedMealRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.school}</TableCell>
                                    <TableCell>{record.class}</TableCell>
                                    <TableCell>{record.mealType}</TableCell>
                                    <TableCell>{record.stats.percentage.toFixed(1)}%</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleViewRecord(record)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExportPdf(record)}>
                                                    <FileDown className="mr-2 h-4 w-4" /> Export PDF
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 {totalPages > 1 && (
                    <CardFooter className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                        </div>
                    </CardFooter>
                 )}
            </Card>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View Meal Record</DialogTitle>
                    {viewingRecord && (
                         <DialogDescription>
                            Showing {viewingRecord.mealType} for {viewingRecord.class} at {viewingRecord.school} on {new Date(viewingRecord.date).toLocaleDateString()}.
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Learner</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {viewingRecord && initialLearners.filter(l => viewingRecord.records.hasOwnProperty(l.id)).map(learner => (
                                <TableRow key={learner.id}>
                                    <TableCell>{learner.name}</TableCell>
                                    <TableCell>{viewingRecord.records[learner.id] ? 'Served' : 'Not Served'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
    
