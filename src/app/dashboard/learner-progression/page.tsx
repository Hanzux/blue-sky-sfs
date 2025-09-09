
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFormState } from 'react-dom';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, Users, TrendingUp, TrendingDown, UserX, UserCheck, ChevronsUp, GraduationCap, Eye } from 'lucide-react';
import { type Learner, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/contexts/audit-log-context';
import { getLearnersWithStatus, updateLearnerStatus, promoteClass } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';

type LearnerWithStatus = Learner & { status: 'Active' | 'Promoted' | 'Retained' | 'Dropped Out' };

type ProgressionMetrics = {
    totalLearners: number;
    promoted: number;
    retained: number;
    droppedOut: number;
};

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const ITEMS_PER_PAGE = 10;

const promoteClassSchema = z.object({
    school: z.string().min(1, 'School is required.'),
    className: z.string().min(1, 'Class name is required.'),
    newClassName: z.string().min(1, 'New class name is required.'),
});
type PromoteClassFormValues = z.infer<typeof promoteClassSchema>;


export default function LearnerProgressionPage() {
    const { toast } = useToast();
    const { addAuditLog } = useAuditLog();
    const [learners, setLearners] = useState<LearnerWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewingLearner, setViewingLearner] = useState<LearnerWithStatus | null>(null);
    
    const [filterDistrict, setFilterDistrict] = useState<string>('All');
    const [filterSchool, setFilterSchool] = useState<string>('All');
    const [filterClass, setFilterClass] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    
    const [updateStatusState, updateStatusAction] = useFormState(updateLearnerStatus, null);
    const [promoteClassState, promoteClassAction] = useFormState(promoteClass, null);

    const promoteForm = useForm<PromoteClassFormValues>({
        resolver: zodResolver(promoteClassSchema),
    });

    const fetchLearners = async () => {
        setLoading(true);
        const learnersWithStatus = await getLearnersWithStatus();
        setLearners(learnersWithStatus);
        setLoading(false);
    }

    useEffect(() => {
        fetchLearners();
    }, []);

    useEffect(() => {
        if (!updateStatusState) return;
        if (updateStatusState.type === 'success') {
            toast({ title: 'Success', description: updateStatusState.message });
            addAuditLog({ action: 'Learner Status Updated', details: updateStatusState.message });
            fetchLearners();
        } else if (updateStatusState.type === 'error') {
            toast({ variant: 'destructive', title: 'Error', description: updateStatusState.message });
        }
    }, [updateStatusState]);

     useEffect(() => {
        if (!promoteClassState) return;
        if (promoteClassState.type === 'success') {
            toast({ title: 'Success', description: promoteClassState.message });
            addAuditLog({ action: 'Class Promoted', details: promoteClassState.message });
            setIsPromoteDialogOpen(false);
            fetchLearners();
        } else if (promoteClassState.type === 'error') {
            toast({ variant: 'destructive', title: 'Error', description: promoteClassState.message });
        }
    }, [promoteClassState]);

    const availableSchools = useMemo(() => {
        if (filterDistrict === 'All') return ["All", ...new Set(initialSchools.map(s => s.name))];
        return ["All", ...initialSchools.filter(s => s.district === filterDistrict).map(s => s.name)];
    }, [filterDistrict]);

    const availableClasses = useMemo(() => {
        if (filterSchool === 'All') return ['All'];
        const schoolLearners = learners.filter(l => l.school === filterSchool);
        const classes = [...new Set(schoolLearners.map(l => l.className))];
        return ['All', ...classes.sort()];
    }, [filterSchool, learners]);

    const filteredLearners = useMemo(() => {
        return learners.filter(learner => {
            const districtMatch = filterDistrict === 'All' || learner.district === filterDistrict;
            const schoolMatch = filterSchool === 'All' || learner.school === filterSchool;
            const classMatch = filterClass === 'All' || learner.className === filterClass;
            return districtMatch && schoolMatch && classMatch;
        });
    }, [learners, filterDistrict, filterSchool, filterClass]);

    const progressionMetrics: ProgressionMetrics = useMemo(() => {
        const data = filteredLearners;
        return {
            totalLearners: data.length,
            promoted: data.filter(l => l.status === 'Promoted').length,
            retained: data.filter(l => l.status === 'Retained').length,
            droppedOut: data.filter(l => l.status === 'Dropped Out').length,
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
        setSelectedRows([]);
    }, [filterDistrict, filterSchool, filterClass]);

    const handleDistrictChange = (district: string) => {
        setFilterDistrict(district);
        setFilterSchool('All');
        setFilterClass('All');
    }

    const handleSchoolChange = (school: string) => {
        setFilterSchool(school);
        setFilterClass('All');
    }

    const getStatusBadgeVariant = (status: LearnerWithStatus['status']) => {
        switch (status) {
            case 'Promoted': return 'default';
            case 'Active': return 'secondary';
            case 'Retained': return 'outline';
            case 'Dropped Out': return 'destructive';
            default: return 'secondary';
        }
    }
    
    const onPromoteSubmit = (values: PromoteClassFormValues) => {
        const formData = new FormData();
        formData.append('school', filterSchool);
        formData.append('className', filterClass);
        formData.append('newClassName', values.newClassName);
        promoteClassAction(formData);
    }

    const handleViewClick = (learner: LearnerWithStatus) => {
        setViewingLearner(learner);
        setIsViewDialogOpen(true);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
          setSelectedRows(paginatedLearners.map(l => l.id));
        } else {
          setSelectedRows([]);
        }
    };
    
    const handleSelectRow = (id: string) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

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
                            <div className="text-2xl font-bold">{progressionMetrics.totalLearners}</div>
                            <p className="text-xs text-muted-foreground">Learners in current filter</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promoted</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progressionMetrics.promoted}</div>
                            <p className="text-xs text-muted-foreground">Advanced to next grade</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Retained</CardTitle>
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progressionMetrics.retained}</div>
                             <p className="text-xs text-muted-foreground">Repeating current grade</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dropped Out</CardTitle>
                            <UserX className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progressionMetrics.droppedOut}</div>
                            <p className="text-xs text-muted-foreground">Left the program</p>
                        </CardContent>
                    </Card>
                </div>


                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                             <div>
                                <CardTitle>Learner Progression</CardTitle>
                                <CardDescription>Track and manage learner progression and status.</CardDescription>
                            </div>
                            <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={filterSchool === 'All' || filterClass === 'All'}>
                                        <ChevronsUp className="mr-2 h-4 w-4" />
                                        Promote Class
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Promote Class</DialogTitle>
                                        <DialogDescription>
                                            Promote all active learners in <strong>{filterClass}</strong> at <strong>{filterSchool}</strong> to the next grade.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...promoteForm}>
                                    <form onSubmit={promoteForm.handleSubmit(onPromoteSubmit)} className="space-y-4">
                                        <input type="hidden" {...promoteForm.register('school')} value={filterSchool} />
                                        <input type="hidden" {...promoteForm.register('className')} value={filterClass} />
                                        <FormField
                                            control={promoteForm.control}
                                            name="newClassName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Class Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Grade 2" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button type="submit">Confirm Promotion</Button>
                                        </DialogFooter>
                                    </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label>District</Label>
                                <Select value={filterDistrict} onValueChange={handleDistrictChange}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>School</Label>
                                <Select value={filterSchool} onValueChange={handleSchoolChange}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{availableSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Class</Label>
                                <Select value={filterClass} onValueChange={setFilterClass} disabled={filterSchool === 'All'}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead padding="checkbox">
                                            <Checkbox
                                                checked={selectedRows.length === paginatedLearners.length && paginatedLearners.length > 0}
                                                onCheckedChange={(value) => handleSelectAll(!!value)}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>School</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                         Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                            </TableRow>
                                         ))
                                    ) : paginatedLearners.map(learner => (
                                        <TableRow key={learner.id} data-state={selectedRows.includes(learner.id) && "selected"}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedRows.includes(learner.id)}
                                                    onCheckedChange={() => handleSelectRow(learner.id)}
                                                    aria-label="Select row"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{learner.name}</TableCell>
                                            <TableCell>{learner.className}</TableCell>
                                            <TableCell>{learner.school}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(learner.status)}>
                                                    {learner.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <form>
                                                    <input type="hidden" name="learnerId" value={learner.id} />
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleViewClick(learner)}>
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <button type="submit" name="status" value="Promoted" formAction={updateStatusAction} className="w-full">
                                                                    <UserCheck className="mr-2 h-4 w-4" />Promote
                                                                </button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                 <button type="submit" name="status" value="Retained" formAction={updateStatusAction} className="w-full">
                                                                    <GraduationCap className="mr-2 h-4 w-4" />Retain
                                                                </button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                 <button type="submit" name="status" value="Dropped Out" formAction={updateStatusAction} className="w-full text-red-600">
                                                                    <UserX className="mr-2 h-4 w-4" />Mark as Dropout
                                                                </button>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {filteredLearners.length === 0 && !loading && (
                                <div className="text-center p-8 text-muted-foreground">
                                    No learners found for the selected filters.
                                </div>
                            )}
                        </div>
                    </CardContent>
                     {totalPages > 1 && (
                        <CardFooter className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {selectedRows.length} of {filteredLearners.length} row(s) selected.
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

                 {/* View Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>View Learner Details</DialogTitle>
                            <DialogDescription>
                                Full profile for {viewingLearner?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        {viewingLearner && (
                           <div className="grid gap-4 py-4">
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Code</Label>
                                   <div className="col-span-2">{viewingLearner.code}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Name</Label>
                                   <div className="col-span-2">{viewingLearner.name}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Date of Birth</Label>
                                   <div className="col-span-2">{viewingLearner.dob}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Gender</Label>
                                   <div className="col-span-2">{viewingLearner.gender}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Guardian</Label>
                                   <div className="col-span-2">{viewingLearner.guardian}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">District</Label>
                                   <div className="col-span-2">{viewingLearner.district}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">School</Label>
                                   <div className="col-span-2">{viewingLearner.school}</div>
                               </div>
                               <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Class</Label>
                                   <div className="col-span-2">{viewingLearner.className}</div>
                               </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                   <Label className="text-right">Status</Label>
                                   <div className="col-span-2">
                                        <Badge variant={getStatusBadgeVariant(viewingLearner.status)}>
                                            {viewingLearner.status}
                                        </Badge>
                                   </div>
                               </div>
                           </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
