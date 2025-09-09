
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
import { initialLearners, type Learner, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Users, HeartPulse, ShieldCheck, ShieldAlert, ShieldX, MoreHorizontal, FileDown, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuditLog } from '@/contexts/audit-log-context';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Badge } from '@/components/ui/badge';


const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const SAVED_ITEMS_PER_PAGE = 5;

type MuacStatus = 'Normal' | 'Moderate' | 'Severe';

type MuacStats = {
    screened: number;
    normal: number;
    moderate: number;
    severe: number;
    total: number;
};

type SavedMuacRecord = {
    id: string;
    date: Date;
    district: string;
    school: string;
    class: string;
    records: Record<string, { value: number, status: MuacStatus }>;
    stats: MuacStats;
};


export default function MuacTrackingPage() {
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();
  
  const [filterDistrict, setFilterDistrict] = useState<string>(districts[1] || 'All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [screeningDate, setScreeningDate] = useState<Date | undefined>(new Date());
  const [muacRecords, setMuacRecords] = useState<Record<string, { value: number | null, status: MuacStatus | null }>>({});
  
  const [savedMuacRecords, setSavedMuacRecords] = useState<SavedMuacRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<SavedMuacRecord | null>(null);

  const [savedFilterDistrict, setSavedFilterDistrict] = useState<string>('All');
  const [savedFilterSchool, setSavedFilterSchool] = useState<string>('All');

    useEffect(() => {
        const storedRecords = localStorage.getItem('savedMuacRecords');
        if (storedRecords) {
            try {
                const parsedRecords = JSON.parse(storedRecords).map((rec: any) => ({...rec, date: new Date(rec.date)}));
                setSavedMuacRecords(parsedRecords);
            } catch (error) {
                console.error("Failed to parse saved MUAC records from localStorage", error);
            }
        }
    }, []);

    useEffect(() => {
        if (savedMuacRecords.length > 0) {
            localStorage.setItem('savedMuacRecords', JSON.stringify(savedMuacRecords));
        }
    }, [savedMuacRecords]);

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
    let learners = initialLearners.filter(learner => learner.school === filterSchool && learner.className === filterClass);
    return learners;
  }, [filterSchool, filterClass]);

  const stats: MuacStats = useMemo(() => {
    const total = filteredLearners.length;
    if (total === 0) return { screened: 0, normal: 0, moderate: 0, severe: 0, total: 0 };
    
    const screened = Object.values(muacRecords).filter(r => r.value !== null).length;
    const normal = Object.values(muacRecords).filter(r => r.status === 'Normal').length;
    const moderate = Object.values(muacRecords).filter(r => r.status === 'Moderate').length;
    const severe = Object.values(muacRecords).filter(r => r.status === 'Severe').length;

    return { screened, normal, moderate, severe, total };
  }, [muacRecords, filteredLearners]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    const schoolsInDistrict = initialSchools.filter(s => s.district === district).map(s => s.name);
    setFilterSchool(schoolsInDistrict[0] || 'All');
    setFilterClass('All');
    setMuacRecords({});
  }

  const handleSchoolChange = (school: string) => {
    setFilterSchool(school);
    setFilterClass('All');
    setMuacRecords({});
  }

  const handleClassChange = (className: string) => {
    setFilterClass(className);
    setMuacRecords({});
  }

  const getMuacStatus = (value: number | null): MuacStatus | null => {
    if (value === null) return null;
    if (value >= 12.5) return 'Normal';
    if (value >= 11.5) return 'Moderate';
    return 'Severe';
  }

  const handleMuacChange = (learnerId: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    const status = getMuacStatus(numericValue);
    setMuacRecords(prev => ({ ...prev, [learnerId]: { value: numericValue, status } }));
  };

  const getStatusBadgeVariant = (status: MuacStatus | null) => {
    switch (status) {
        case 'Normal': return 'default';
        case 'Moderate': return 'secondary';
        case 'Severe': return 'destructive';
        default: return 'outline';
    }
}

  const handleSave = () => {
    if (!screeningDate || filteredLearners.length === 0 || stats.screened === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save',
        description: 'Please ensure you have selected a class and recorded MUAC for at least one learner.',
      });
      return;
    }

    const newRecord: SavedMuacRecord = {
      id: new Date().toISOString(),
      date: screeningDate,
      district: filterDistrict,
      school: filterSchool,
      class: filterClass,
      records: muacRecords as Record<string, { value: number; status: MuacStatus; }>,
      stats: { ...stats },
    };
    
    setSavedMuacRecords(prev => [newRecord, ...prev]);

    const description = `MUAC screening for ${filterClass} at ${filterSchool} on ${screeningDate?.toLocaleDateString()} has been saved.`;
    toast({
      title: 'MUAC Records Saved',
      description,
    });
    addAuditLog({ action: 'MUAC Recorded', details: `Recorded MUAC for ${stats.screened} learners in ${filterClass} at ${filterSchool}` });
    setMuacRecords({});
  }
  
  const handleViewRecord = (record: SavedMuacRecord) => {
    setViewingRecord(record);
    setIsViewDialogOpen(true);
  }

  const handleExportPdf = (record: SavedMuacRecord) => {
    const doc = new jsPDF();
    const learnersInRecord = initialLearners.filter(l => record.records[l.id]);

    doc.setFontSize(18);
    doc.text(`MUAC Screening Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`School: ${record.school}`, 14, 30);
    doc.text(`Class: ${record.class}`, 14, 36);
    doc.text(`Date: ${record.date.toLocaleDateString()}`, 14, 42);

    (doc as any).autoTable({
        startY: 50,
        head: [['Learner Name', 'MUAC (cm)', 'Status']],
        body: learnersInRecord.map(learner => [
            learner.name,
            record.records[learner.id]?.value ?? 'N/A',
            record.records[learner.id]?.status ?? 'N/A',
        ]),
    });
    
    doc.save(`muac_${record.school}_${record.class}_${record.date.toISOString().split('T')[0]}.pdf`);
    addAuditLog({ action: 'MUAC Report Exported', details: `Exported PDF for ${record.class} at ${record.school}` });
  }

  const filteredSavedRecords = useMemo(() => {
    return savedMuacRecords.filter(record => {
      const districtMatch = savedFilterDistrict === 'All' || record.district === savedFilterDistrict;
      const schoolMatch = savedFilterSchool === 'All' || record.school === savedFilterSchool;
      return districtMatch && schoolMatch;
    });
  }, [savedMuacRecords, savedFilterDistrict, savedFilterSchool]);
  

  const paginatedSavedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * SAVED_ITEMS_PER_PAGE;
    const endIndex = startIndex + SAVED_ITEMS_PER_PAGE;
    return filteredSavedRecords.slice(startIndex, endIndex);
  }, [filteredSavedRecords, currentPage]);

  const totalPages = Math.ceil(filteredSavedRecords.length / SAVED_ITEMS_PER_PAGE);

  const availableSavedSchools = useMemo(() => {
    if (savedFilterDistrict === 'All') {
      return ["All", ...new Set(savedMuacRecords.map(s => s.school))];
    }
    const schoolsInDistrict = [...new Set(savedMuacRecords.filter(s => s.district === savedFilterDistrict).map(s => s.school))];
    return ["All", ...schoolsInDistrict];
  }, [savedFilterDistrict, savedMuacRecords]);

  const handleSavedDistrictChange = (district: string) => {
    setSavedFilterDistrict(district);
    setSavedFilterSchool('All');
    setCurrentPage(1);
  }

  const handleSavedSchoolChange = (school: string) => {
    setSavedFilterSchool(school);
    setCurrentPage(1);
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Learners Screened</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.screened} / {stats.total}</div>
                    <Progress value={(stats.screened/stats.total) * 100} className="h-2 mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Normal (Green)</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.normal}</div>
                    <p className="text-xs text-muted-foreground">Well-nourished learners</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Moderate (Yellow)</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.moderate}</div>
                    <p className="text-xs text-muted-foreground">At-risk learners</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Severe (Red)</CardTitle>
                    <ShieldX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.severe}</div>
                     <p className="text-xs text-muted-foreground">Acutely malnourished learners</p>
                </CardContent>
            </Card>
        </div>


      <Card className="w-full">
        <CardHeader>
          <CardTitle>MUAC Screening</CardTitle>
          <CardDescription>Record and monitor learner nutritional status using MUAC measurements.</CardDescription>
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
                <Label>Screening Date</Label>
                <Input
                    type="date"
                    value={screeningDate ? format(screeningDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setScreeningDate(e.target.value ? new Date(e.target.value) : undefined)}
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
                  <TableHead>Gender</TableHead>
                  <TableHead className='text-right'>MUAC (cm)</TableHead>
                  <TableHead className='text-right'>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLearners.length > 0 ? filteredLearners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell className="font-medium">{learner.name}</TableCell>
                    <TableCell>{learner.gender}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        className="w-24 ml-auto"
                        placeholder="e.g. 12.5"
                        value={muacRecords[learner.id]?.value ?? ''}
                        onChange={(e) => handleMuacChange(learner.id, e.target.value)}
                      />
                    </TableCell>
                     <TableCell className="text-right">
                        <Badge variant={getStatusBadgeVariant(muacRecords[learner.id]?.status)}>
                            {muacRecords[learner.id]?.status ?? 'Not Screened'}
                        </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            Select a school and class to record MUAC.
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
                    <p><strong>Screened:</strong> {stats.screened}/{stats.total}</p>
                </div>
                <Button onClick={handleSave} disabled={stats.screened === 0}>Save MUAC Records</Button>
            </CardFooter>
        )}
      </Card>

        {savedMuacRecords.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Saved MUAC Records</CardTitle>
                    <CardDescription>View and export previously saved MUAC screenings.</CardDescription>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Filter by District</Label>
                            <Select value={savedFilterDistrict} onValueChange={handleSavedDistrictChange}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                                <SelectContent>
                                {["All", ...new Set(savedMuacRecords.map(r => r.district))].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                                <TableHead>Screened</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSavedRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.school}</TableCell>
                                    <TableCell>{record.class}</TableCell>
                                    <TableCell>{record.stats.screened} / {record.stats.total}</TableCell>
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
                    <DialogTitle>View MUAC Record</DialogTitle>
                    {viewingRecord && (
                         <DialogDescription>
                            Showing screening for {viewingRecord.class} at {viewingRecord.school} on {new Date(viewingRecord.date).toLocaleDateString()}.
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Learner</TableHead>
                                <TableHead>MUAC (cm)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {viewingRecord && initialLearners.filter(l => viewingRecord.records[l.id]).map(learner => (
                                <TableRow key={learner.id}>
                                    <TableCell>{learner.name}</TableCell>
                                    <TableCell>{viewingRecord.records[learner.id].value}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(viewingRecord.records[learner.id].status)}>
                                            {viewingRecord.records[learner.id].status}
                                        </Badge>
                                    </TableCell>
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
