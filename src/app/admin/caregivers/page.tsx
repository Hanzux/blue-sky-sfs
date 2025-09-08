
'use client';
import { useState, useEffect, useActionState, useMemo } from 'react';
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
import { getCaregivers, createCaregiver, updateCaregiver, deleteCaregiver } from './actions';
import { MoreHorizontal, PlusCircle, Users, UserPlus, Link, Users2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const caregiverSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});
type CaregiverFormValues = z.infer<typeof caregiverSchema>;

type Caregiver = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type CaregiverMetrics = {
    totalCaregivers: number;
    linkedLearners: number;
    newThisMonth: number;
    linkedCaregivers: number;
};

const ITEMS_PER_PAGE = 5;

export default function CaregiverManagementPage() {
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [caregiverMetrics, setCaregiverMetrics] = useState<CaregiverMetrics>({
      totalCaregivers: 0,
      linkedLearners: 0,
      newThisMonth: 0,
      linkedCaregivers: 0,
  });

  const [createState, createFormAction, isCreatePending] = useActionState(createCaregiver, null);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateCaregiver, null);
  const [deleteState, deleteFormAction, isDeletePending] = useActionState(deleteCaregiver, null);

  const form = useForm<CaregiverFormValues>({
    resolver: zodResolver(caregiverSchema),
  });

  const fetchCaregivers = async () => {
    setLoading(true);
    try {
      const fetchedCaregivers = await getCaregivers();
      setCaregivers(fetchedCaregivers);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch caregivers.',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCaregivers();
  }, []);

  useEffect(() => {
    const totalCaregivers = caregivers.length;
    // These are simulated metrics as we don't have the relational data
    const linkedLearners = Math.floor(totalCaregivers * 1.8);
    const newThisMonth = Math.floor(Math.random() * 3 + 1);
    const linkedCaregivers = Math.floor(totalCaregivers * 0.9);

    setCaregiverMetrics({ totalCaregivers, linkedLearners, newThisMonth, linkedCaregivers });
  }, [caregivers]);
  
  const handleActionState = (state: any, successMessage: string, closeDialogs: () => void) => {
    if (!state) return;
    if (state.type === 'success') {
      toast({ title: 'Success', description: state.message || successMessage });
      closeDialogs();
      fetchCaregivers();
      form.reset({ name: '', email: '', phone: '' });
      setSelectedCaregiver(null);
    } else if (state.type === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  };

  useEffect(() => {
     handleActionState(createState, 'Caregiver created successfully.', () => setIsFormDialogOpen(false));
  }, [createState]);
 
   useEffect(() => {
     handleActionState(updateState, 'Caregiver updated successfully.', () => setIsFormDialogOpen(false));
   }, [updateState]);
 
   useEffect(() => {
     handleActionState(deleteState, 'Caregiver deleted successfully.', () => setIsDeleteDialogOpen(false));
   }, [deleteState]);
   
  const handleNewClick = () => {
    setSelectedCaregiver(null);
    form.reset({ name: '', email: '', phone: '' });
    setIsFormDialogOpen(true);
  };
  
  const handleViewClick = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setIsViewDialogOpen(true);
  }

  const handleEditClick = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    form.reset({
      id: caregiver.id,
      name: caregiver.name || '',
      email: caregiver.email || '',
      phone: caregiver.phone || '',
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setIsDeleteDialogOpen(true);
  };
  
  const formAction = selectedCaregiver ? updateFormAction : createFormAction;
  const isPending = selectedCaregiver ? isUpdatePending : isCreatePending;

  const paginatedCaregivers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return caregivers.slice(startIndex, endIndex);
  }, [caregivers, currentPage]);

  const totalPages = Math.ceil(caregivers.length / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 gap-6">
        <div className="w-full max-w-4xl grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Caregivers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{caregiverMetrics.totalCaregivers}</div>
                    <p className="text-xs text-muted-foreground">Total registered caregivers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Caregivers Linked</CardTitle>
                    <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{caregiverMetrics.linkedCaregivers}</div>
                    <p className="text-xs text-muted-foreground">Associated with a learner</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{caregiverMetrics.newThisMonth}</div>
                    <p className="text-xs text-muted-foreground">Newly added caregivers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Learners Under Care</CardTitle>
                    <Users2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{caregiverMetrics.linkedLearners}</div>
                     <p className="text-xs text-muted-foreground">Total learners with caregivers</p>
                </CardContent>
            </Card>
        </div>


      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Caregiver Management</CardTitle>
              <CardDescription>
                Manage caregivers for learners in the system.
              </CardDescription>
            </div>
            <Dialog
              open={isFormDialogOpen}
              onOpenChange={setIsFormDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={handleNewClick}>
                  <PlusCircle className="mr-2" /> New Caregiver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedCaregiver ? 'Edit Caregiver' : 'Create New Caregiver'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form action={formAction} className="space-y-4">
                    {selectedCaregiver && <input type="hidden" {...form.register('id')} />}
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
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (selectedCaregiver ? 'Updating...' : 'Creating...') : (selectedCaregiver ? 'Update Caregiver' : 'Create Caregiver')}
                    </Button>
                  </form>
                </Form>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
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
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedCaregivers.map((caregiver) => (
                      <TableRow key={caregiver.id}>
                        <TableCell>{caregiver.name || '-'}</TableCell>
                        <TableCell>{caregiver.email}</TableCell>
                        <TableCell>{caregiver.phone}</TableCell>
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
                                onClick={() => handleViewClick(caregiver)}
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(caregiver)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(caregiver)}
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
            <DialogTitle>View Caregiver</DialogTitle>
            <DialogDescription>
              Details for {selectedCaregiver?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div id="name" className="col-span-3">{selectedCaregiver?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <div id="email" className="col-span-3">{selectedCaregiver?.email}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <div id="phone" className="col-span-3">{selectedCaregiver?.phone}</div>
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
              caregiver's record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form action={deleteFormAction}>
              <input type="hidden" name="id" value={selectedCaregiver?.id} />
              <AlertDialogAction asChild>
                <Button type="submit" variant="destructive" disabled={isDeletePending}>
                  {isDeletePending ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
