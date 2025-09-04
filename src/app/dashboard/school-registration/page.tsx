
'use client';

import { useState } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { SchoolForm } from '@/components/school-form';
import { initialSchools, type School } from '@/lib/data';

export default function SchoolRegistrationPage() {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | undefined>(undefined);

  const handleAddSchool = (school: Omit<School, 'id'>) => {
    const newSchool = { ...school, id: (schools.length + 1).toString() };
    setSchools([...schools, newSchool]);
    setIsDialogOpen(false);
  };
  
  const handleUpdateSchool = (school: School) => {
    setSchools(schools.map(s => s.id === school.id ? school : s));
    setEditingSchool(undefined);
    setIsDialogOpen(false);
  }

  const handleDeleteSchool = (id: string) => {
    setSchools(schools.filter(school => school.id !== id));
  };

  const handleEditClick = (school: School) => {
    setEditingSchool(school);
    setIsDialogOpen(true);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingSchool(undefined);
    }
    setIsDialogOpen(open);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>School Registration</CardTitle>
                <CardDescription>Manage and register new schools into the system.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
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
                {schools.map((school) => (
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
    </Card>
  );
}
