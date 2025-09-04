
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { SchoolForm } from '@/components/school-form';
import { initialSchools, type School } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const ITEMS_PER_PAGE = 5;

export default function SchoolRegistrationPage() {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | undefined>(undefined);
  const [viewingSchool, setViewingSchool] = useState<School | undefined>(undefined);
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return schools;
    }
    return schools.filter(school => school.district === filterDistrict);
  }, [schools, filterDistrict]);

  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSchools.slice(startIndex, endIndex);
  }, [filteredSchools, currentPage]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict]);

  const handleAddSchool = (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: (schools.length + 1).toString() };
    setSchools([...schools, newSchool]);
    setIsFormDialogOpen(false);
  };
  
  const handleUpdateSchool = (school: School) => {
    setSchools(schools.map(s => s.id === school.id ? school : s));
    setEditingSchool(undefined);
    setIsFormDialogOpen(false);
  }

  const handleDeleteSchool = (id: string) => {
    setSchools(schools.filter(school => school.id !== id));
  };
  
  const handleViewClick = (school: School) => {
    setViewingSchool(school);
    setIsViewDialogOpen(true);
  }

  const handleEditClick = (school: School) => {
    setEditingSchool(school);
    setIsFormDialogOpen(true);
  }

  const handleFormDialogClose = (open: boolean) => {
    if (!open) {
      setEditingSchool(undefined);
    }
    setIsFormDialogOpen(open);
  }

  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-4xl">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>School Registration</CardTitle>
                    <CardDescription>Manage and register new schools into the system.</CardDescription>
                </div>
                <Dialog open={isFormDialogOpen} onOpenChange={handleFormDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" />
                            New School
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSchool ? 'Edit School' : 'Register New School'}</DialogTitle>
                        </DialogHeader>
                        <SchoolForm 
                            onSubmit={editingSchool ? handleUpdateSchool : handleAddSchool} 
                            school={editingSchool}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>District</Label>
                  <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                    <TableHead className="hidden sm:table-cell">District</TableHead>
                    <TableHead className="hidden md:table-cell">Learners</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedSchools.map((school) => (
                    <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{school.district}</TableCell>
                        <TableCell className="hidden md:table-cell">{school.learners}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewClick(school)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(school)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteSchool(school.id)}>Delete</DropdownMenuItem>
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View School</DialogTitle>
                    <DialogDescription>Details for {viewingSchool?.name}.</DialogDescription>
                </DialogHeader>
                {viewingSchool && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <div className="col-span-3">{viewingSchool.name}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">District</Label>
                            <div className="col-span-3">{viewingSchool.district}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Learners</Label>
                            <div className="col-span-3">{viewingSchool.learners}</div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}

    