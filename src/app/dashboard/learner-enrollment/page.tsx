
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { LearnerForm } from '@/components/learner-form';
import { initialLearners, type Learner, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];

export default function LearnerEnrollmentPage() {
  const [learners, setLearners] = useState<Learner[]>(initialLearners);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<Learner | undefined>(undefined);
  const [viewingLearner, setViewingLearner] = useState<Learner | undefined>(undefined);
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');

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

  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-6xl">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Learner Enrollment</CardTitle>
                    <CardDescription>Manage and enroll new learners into the system.</CardDescription>
                </div>
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
                    <TableHead className="hidden sm:table-cell">Date of Birth</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="hidden md:table-cell">Class</TableHead>
                    <TableHead className="hidden md:table-cell">Guardian</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredLearners.map((learner) => (
                    <TableRow key={learner.id}>
                        <TableCell className="font-medium">{learner.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{learner.dob}</TableCell>
                        <TableCell>{learner.district}</TableCell>
                        <TableCell>{learner.school}</TableCell>
                        <TableCell className="hidden md:table-cell">{learner.className}</TableCell>
                        <TableCell className="hidden md:table-cell">{learner.guardian}</TableCell>
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
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View Learner</DialogTitle>
                    <DialogDescription>Details for {viewingLearner?.name}.</DialogDescription>
                </DialogHeader>
                {viewingLearner && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <div className="col-span-3">{viewingLearner.name}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Date of Birth</Label>
                            <div className="col-span-3">{viewingLearner.dob}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">District</Label>
                            <div className="col-span-3">{viewingLearner.district}</div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">School</Label>
                            <div className="col-span-3">{viewingLearner.school}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Class</Label>
                            <div className="col-span-3">{viewingLearner.className}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Guardian</Label>
                            <div className="col-span-3">{viewingLearner.guardian}</div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
