
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getVolunteers, createVolunteer, updateVolunteer, deleteVolunteer, importVolunteers } from './actions';
import { MoreHorizontal, PlusCircle, Users, School, Upload, Download, HandHeart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useAuditLog } from '@/contexts/audit-log-context';
import { initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const volunteerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  school: z.string().min(1, { message: 'Please select a school.' }),
});
type VolunteerFormValues = z.infer<typeof volunteerSchema>;

type Volunteer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
};

type VolunteerMetrics = {
    totalVolunteers: number;
    assignedSchools: number;
    unassignedVolunteers: number;
};

const ITEMS_PER_PAGE = 5;

export default function VolunteerManagementPage() {
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [volunteerMetrics, setVolunteerMetrics] = useState<VolunteerMetrics | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createState, createFormAction] = useFormState(createVolunteer, null);
  const [updateState, updateFormAction] = useFormState(updateVolunteer, null);
  const [deleteState, deleteFormAction] = useFormState(deleteVolunteer, null);

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerSchema),
  });

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const fetchedVolunteers = await getVolunteers();
      setVolunteers(fetchedVolunteers.reverse());
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch volunteers.',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    if (volunteers.length > 0) {
        const assignedSchools = new Set(volunteers.map(v => v.school)).size;
        setVolunteerMetrics({
            totalVolunteers: volunteers.length,
            assignedSchools,
            unassignedVolunteers: volunteers.filter(v => !v.school).length,
        });
    }
  }, [volunteers]);
  
  const handleActionState = (state: any, action: string, detailsFn: (state: any) => string) => {
    if (!state) return;
    if (state.type === 'success') {
      toast({ title: 'Success', description: state.message });
      addAuditLog({ action, details: detailsFn(state) });
      setIsFormDialogOpen(false);
      setIsDeleteDialogOpen(false);
      fetchVolunteers();
      form.reset({ name: '', email: '', phone: '', school: '' });
      setSelectedVolunteer(null);
    } else if (state.type === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  };

  useEffect(() => {
     handleActionState(createState, 'Volunteer Created', (s) => s.message);
  }, [createState]);
 
   useEffect(() => {
     handleActionState(updateState, 'Volunteer Updated', (s) => `Updated details for volunteer ID ${selectedVolunteer?.id}`);
   }, [updateState]);
 
   useEffect(() => {
     handleActionState(deleteState, 'Volunteer Deleted', (s) => `Deleted volunteer ID ${selectedVolunteer?.id}`);
   }, [deleteState]);
   
  const handleNewClick = () => {
    setSelectedVolunteer(null);
    form.reset({ name: '', email: '', phone: '', school: '' });
    setIsFormDialogOpen(true);
  };
  
  const handleViewClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsViewDialogOpen(true);
  }

  const handleEditClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    form.reset({
      id: volunteer.id,
      name: volunteer.name || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      school: volunteer.school || '',
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsDeleteDialogOpen(true);
  };

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
        const newVolunteers = lines.map(line => {
            const [name, email, phone, school] = line.split(',');
            return { name, email, phone, school };
        }).filter(c => c.name && c.email && c.phone && c.school); // Filter out empty lines

        try {
            const result = await importVolunteers(newVolunteers);
            if (result.type === 'success') {
                toast({ title: 'Success', description: result.message });
                addAuditLog({ action: 'Volunteers Imported', details: `Imported ${newVolunteers.length} volunteers.` });
                fetchVolunteers(); // Refetch data
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to import volunteers.'})
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }
  
  const formAction = selectedVolunteer ? updateFormAction : createFormAction;

  const paginatedVolunteers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return volunteers.slice(startIndex, endIndex);
  }, [volunteers, currentPage]);

  const totalPages = Math.ceil(volunteers.length / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 gap-6">
        <div className="w-full max-w-4xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{volunteerMetrics?.totalVolunteers ?? <Skeleton className="h-8 w-1/4" />}</div>
                    <p className="text-xs text-muted-foreground">Total registered volunteers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Schools</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{volunteerMetrics?.assignedSchools ?? <Skeleton className="h-8 w-1/4" />}</div>
                    <p className="text-xs text-muted-foreground">Schools with assigned volunteers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Volunteers Needed</CardTitle>
                    <HandHeart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.max(0, initialSchools.length - (volunteerMetrics?.assignedSchools ?? 0))}</div>
                    <p className="text-xs text-muted-foreground">Schools without volunteers</p>
                </CardContent>
            </Card>
        </div>


      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Volunteer Management</CardTitle>
              <CardDescription>
                Manage feeding volunteers for schools in the system.
              </CardDescription>
            </div>
            <div className="flex gap-2">
               <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                <Button variant="outline" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <Button variant="outline" asChild>
                    <a href="/volunteer_template.csv" download>
                        <Download className="mr-2 h-4 w-4" /> Template
                    </a>
                </Button>
                <Dialog
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                >
                <DialogTrigger asChild>
                    <Button onClick={handleNewClick}>
                    <PlusCircle className="mr-2" /> New Volunteer
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{selectedVolunteer ? 'Edit Volunteer' : 'Create New Volunteer'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                    <form action={formAction} className="space-y-4">
                        {selectedVolunteer && <input type="hidden" {...form.register('id')} />}
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Full Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="email@example.com"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="123-456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                            control={form.control}
                            name="school"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>School Assignment</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a school" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {initialSchools.map(school => (
                                        <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <Button type="submit" className="w-full">
                            {selectedVolunteer ? 'Update Volunteer' : 'Create Volunteer'}
                        </Button>
                    </form>
                    </Form>
                </DialogContent>
                </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[200px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>{volunteer.name || '-'}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell>{volunteer.phone}</TableCell>
                        <TableCell>{volunteer.school}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewClick(volunteer)}
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(volunteer)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(volunteer)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
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
            <DialogTitle>View Volunteer</DialogTitle>
            <DialogDescription>
              Details for {selectedVolunteer?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div id="name" className="col-span-3">{selectedVolunteer?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <div id="email" className="col-span-3">{selectedVolunteer?.email}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <div id="phone" className="col-span-3">{selectedVolunteer?.phone}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">School</Label>
              <div id="school" className="col-span-3">{selectedVolunteer?.school}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              volunteer's record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form action={deleteFormAction}>
              <input type="hidden" name="id" value={selectedVolunteer?.id} />
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive">
                  Delete
                </Button>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
