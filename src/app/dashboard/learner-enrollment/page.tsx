
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Users, School, Building, PersonStanding, Download, Upload } from 'lucide-react';
import { LearnerForm } from '@/components/learner-form';
import { initialLearners, type Learner, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { addLearners } from './actions';
import { useToast } from '@/hooks/use-toast';


const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const ITEMS_PER_PAGE = 5;

export default function LearnerEnrollmentPage() {
  const { toast } = useToast();
  const [learners, setLearners] = useState<Learner[]>(initialLearners);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<Learner | undefined>(undefined);
  const [viewingLearner, setViewingLearner] = useState<Learner | undefined>(undefined);
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return ["All", ...initialSchools.map(s => s.name)];
    }
    return ["All", ...initialSchools.filter(s => s.district === filterDistrict).map(s => s.name)];
  }, [filterDistrict]);

  const filteredLearners = useMemo(() => {
    return learners.filter(learner => {
      const districtMatch = filterDistrict === 'All' || learner.district === filterDistrict;
      const schoolMatch = filterSchool === 'All' || learner.school === filterSchool;
      return districtMatch && schoolMatch;
    });
  }, [learners, filterDistrict, filterSchool]);
  
  const learnerMetrics = useMemo(() => {
    const totalLearners = filteredLearners.length;
    const maleLearners = filteredLearners.filter(l => l.gender === 'Male').length;
    const femaleLearners = totalLearners - maleLearners;
    const genderRatio = totalLearners > 0 ? (maleLearners / totalLearners) * 100 : 0;
    const schools = new Set(filteredLearners.map(l => l.school));
    const districts = new Set(filteredLearners.map(l => l.district));
    return {
        totalLearners,
        maleLearners,
        femaleLearners,
        genderRatio,
        schoolCount: schools.size,
        districtCount: districts.size
    }
  }, [filteredLearners]);

  const paginatedLearners = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLearners.slice(startIndex, endIndex);
  }, [filteredLearners, currentPage]);

  const totalPages = Math.ceil(filteredLearners.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterSchool]);

  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    setFilterSchool('All');
  }

  const handleAddLearner = (learner: Omit<Learner, 'id'>) => {
    const newLearner = { ...learner, id: (learners.length + 1).toString() };
    setLearners([...learners, newLearner]);
    setIsFormDialogOpen(false);
  };
  
  const handleUpdateLearner = (learner: Learner) => {
    setLearners(learners.map(l => l.id === learner.id ? learner : l));
    setEditingLearner(undefined);
    setIsFormDialogOpen(false);
  }

  const handleDeleteLearner = (id: string) => {
    setLearners(learners.filter(learner => learner.id !== id));
  };
  
  const handleViewClick = (learner: Learner) => {
    setViewingLearner(learner);
    setIsViewDialogOpen(true);
  }

  const handleEditClick = (learner: Learner) => {
    setEditingLearner(learner);
    setIsFormDialogOpen(true);
  }

  const handleFormDialogClose = (open: boolean) => {
    if (!open) {
      setEditingLearner(undefined);
    }
    setIsFormDialogOpen(open);
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(1); // Skip header
        const newLearners = lines.map(line => {
            const [name, dob, gender, className, guardian, district, school] = line.split(',');
            return { name, dob, gender, className, guardian, district, school };
        }).filter(l => l.name); // Filter out empty lines

        try {
            const result = await addLearners(newLearners as Omit<Learner, 'id'>[]);
            if (result.type === 'success') {
                toast({ title: 'Success', description: result.message });
                // Note: In a real app, you would refetch learners here.
                // For this mock version, we will manually add them to see the effect.
                const learnersToAdd = newLearners.map((learner, i) => ({ ...learner, id: (learners.length + i + 1).toString() }))
                setLearners(prev => [...prev, ...learnersToAdd as Learner[]]);
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to import learners.'})
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learnerMetrics.totalLearners}</div>
                    <p className="text-xs text-muted-foreground">Total enrolled learners</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gender Distribution</CardTitle>
                    <PersonStanding className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learnerMetrics.maleLearners} Male / {learnerMetrics.femaleLearners} Female</div>
                    <Progress value={learnerMetrics.genderRatio} className="h-2 mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Schools</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learnerMetrics.schoolCount}</div>
                    <p className="text-xs text-muted-foreground">Total schools with enrollments</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Districts</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learnerMetrics.districtCount}</div>
                     <p className="text-xs text-muted-foreground">Total districts covered</p>
                </CardContent>
            </Card>
        </div>


        <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between gap-2">
                <div>
                    <CardTitle>Learner Enrollment</CardTitle>
                    <CardDescription>Manage and enroll new learners into the system.</CardDescription>
                </div>
                <div className='flex gap-2'>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                     <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="mr-2 h-4 w-4" /> Import
                    </Button>
                     <Button variant="outline" asChild>
                        <a href="/learner_template.csv" download>
                           <Download className="mr-2 h-4 w-4" /> Template
                        </a>
                    </Button>
                    <Dialog open={isFormDialogOpen} onOpenChange={handleFormDialogClose}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2" />
                                New Learner
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingLearner ? 'Edit Learner' : 'Enroll New Learner'}</DialogTitle>
                            </DialogHeader>
                            <LearnerForm 
                                onSubmit={editingLearner ? handleUpdateLearner : handleAddLearner} 
                                learner={editingLearner}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
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
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="hidden sm:table-cell">Date of Birth</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="hidden md:table-cell">Class</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedLearners.map((learner) => (
                    <TableRow key={learner.id}>
                        <TableCell className="font-medium">{learner.name}</TableCell>
                        <TableCell>{learner.gender}</TableCell>
                        <TableCell className="hidden sm:table-cell">{learner.dob}</TableCell>
                        <TableCell>{learner.district}</TableCell>
                        <TableCell>{learner.school}</TableCell>
                        <TableCell className="hidden md:table-cell">{learner.className}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewClick(learner)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(learner)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteLearner(learner.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
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
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>View Learner</DialogTitle>
                    <DialogDescription>Details for {viewingLearner?.name}.</DialogDescription>
                </DialogHeader>
                {viewingLearner && (
                    <div className="grid gap-6 py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Learner Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">Name</Label>
                                    <div>{viewingLearner.name}</div>
                                </div>
                                 <div className="grid gap-1">
                                    <Label className="text-muted-foreground">Gender</Label>
                                    <div>{viewingLearner.gender}</div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">Date of Birth</Label>
                                    <div>{viewingLearner.dob}</div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">District</Label>
                                    <div>{viewingLearner.district}</div>
                                </div>
                                 <div className="grid gap-1">
                                    <Label className="text-muted-foreground">School</Label>
                                    <div>{viewingLearner.school}</div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">Class</Label>
                                    <div>{viewingLearner.className}</div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">Guardian</Label>
                                    <div>{viewingLearner.guardian}</div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Attendance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground">School Attendance Rate</Label>
                                        <Progress value={92} className="h-2 mt-1" />
                                        <p className="text-sm text-right font-medium">92%</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Class Attendance Rate</Label>
                                        <Progress value={95} className="h-2 mt-1" />
                                         <p className="text-sm text-right font-medium">95%</p>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Days Present:</strong> 46</p>
                                        <p><strong>Days Absent:</strong> 3</p>
                                        <p><strong>Days Excused:</strong> 1</p>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Feeding Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground">Overall Feed Rate</Label>
                                        <Progress value={98} className="h-2 mt-1" />
                                        <p className="text-sm text-right font-medium">98%</p>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Meals Served:</strong></p>
                                        <ul className="list-disc pl-5">
                                            <li>Breakfast: 48</li>
                                            <li>Lunch: 49</li>
                                        </ul>
                                        <p><strong>Meals Missed:</strong> 1 (Lunch)</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        </div>
    </div>
  );
}
