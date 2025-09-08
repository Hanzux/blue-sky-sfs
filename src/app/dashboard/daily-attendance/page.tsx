
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
import { initialLearners, type Learner, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Users, CheckCheck, UserCheck, UserX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuditLog } from '@/contexts/audit-log-context';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];

type AttendanceStatus = 'present' | 'absent' | 'excused';

export default function DailyAttendancePage() {
  const [filterDistrict, setFilterDistrict] = useState<string>(districts[1] || 'All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [attendanceDate, setAttendanceDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();

  const availableSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return ["All", ...initialSchools.map(s => s.name)];
    }
    const schoolsInDistrict = initialSchools.filter(s => s.district === filterDistrict).map(s => s.name);
    // Set first school as default if current school is not in the new district
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
    if (filterSchool === 'All') return [];
    let learners = initialLearners.filter(learner => learner.school === filterSchool);
    if(filterClass !== 'All') {
        learners = learners.filter(learner => learner.className === filterClass);
    }
    return learners;
  }, [filterSchool, filterClass]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    const schoolsInDistrict = initialSchools.filter(s => s.district === district).map(s => s.name);
    setFilterSchool(schoolsInDistrict[0] || 'All');
    setFilterClass('All');
    setAttendance({});
  }

  const handleSchoolChange = (school: string) => {
    setFilterSchool(school);
    setFilterClass('All');
    setAttendance({});
  }

  const handleClassChange = (className: string) => {
    setFilterClass(className);
    setAttendance({});
  }

  const handleStatusChange = (learnerId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [learnerId]: status }));
  };

  const handleSave = () => {
    const description = `Attendance for ${filterClass} at ${filterSchool} on ${attendanceDate?.toLocaleDateString()} has been recorded.`;
    console.log({
      date: attendanceDate,
      school: filterSchool,
      district: filterDistrict,
      class: filterClass,
      records: attendance,
    });
    toast({
      title: 'Attendance Saved',
      description,
    });
    addAuditLog({ action: 'Attendance Recorded', details: `Recorded attendance for ${Object.keys(attendance).length} learners in ${filterClass} at ${filterSchool}` });
  }
  
  const stats = useMemo(() => {
    const total = filteredLearners.length;
    if (total === 0) return { present: 0, absent: 0, excused: 0, total: 0, percentage: 0 };

    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
    const excusedCount = Object.values(attendance).filter(s => s === 'excused').length;
    const percentage = total > 0 ? (presentCount / total) * 100 : 0;
    return { present: presentCount, absent: absentCount, excused: excusedCount, total, percentage };
  }, [attendance, filteredLearners]);


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
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <CheckCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.percentage.toFixed(1)}%</div>
                    <Progress value={stats.percentage} className="h-2 mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.present}</div>
                    <p className="text-xs text-muted-foreground">Learners marked as present</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Absent / Excused</CardTitle>
                    <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.absent + stats.excused}</div>
                     <p className="text-xs text-muted-foreground">{stats.absent} Absent, {stats.excused} Excused</p>
                </CardContent>
            </Card>
        </div>


      <Card className="w-full">
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>Record and monitor daily learner attendance for a selected school.</CardDescription>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
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
                    value={attendanceDate ? format(attendanceDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setAttendanceDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner Name</TableHead>
                  <TableHead className='text-right'>Attendance Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLearners.length > 0 ? filteredLearners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell className="font-medium">{learner.name}</TableCell>
                    <TableCell className="text-right">
                      <RadioGroup
                        defaultValue="present"
                        onValueChange={(value) => handleStatusChange(learner.id, value as AttendanceStatus)}
                        className="flex justify-end gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="present" id={`present-${learner.id}`} />
                          <Label htmlFor={`present-${learner.id}`}>Present</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="absent" id={`absent-${learner.id}`} />
                          <Label htmlFor={`absent-${learner.id}`}>Absent</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="excused" id={`excused-${learner.id}`} />
                          <Label htmlFor={`excused-${learner.id}`}>Excused</Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">
                            Select a school and class to record attendance.
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
                    <p><strong>Present:</strong> {stats.present}/{stats.total} ({stats.percentage.toFixed(1)}%)</p>
                    <p><strong>Absent:</strong> {stats.absent} | <strong>Excused:</strong> {stats.excused}</p>
                </div>
                <Button onClick={handleSave}>Save Attendance</Button>
            </CardFooter>
        )}
      </Card>
      </div>
    </div>
  );
}
