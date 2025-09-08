
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useActionState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { type FoodItem, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StockAdjustmentForm } from '@/components/stock-adjustment-form';
import { adjustStock, getFoodItems } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Package2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useAuditLog } from '@/contexts/audit-log-context';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const LOW_STOCK_THRESHOLD = 30;
const ITEMS_PER_PAGE = 5;

export default function StockTrackingPage() {
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [adjustState, adjustFormAction, isAdjustPending] = useActionState(adjustStock, null);

  const fetchItems = async () => {
    setLoading(true);
    const items = await getFoodItems();
    setFoodItems(items);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!adjustState) return;
    if (adjustState.type === 'success') {
        toast({ title: 'Success', description: adjustState.message });
        const details = adjustState.message;
        addAuditLog({ action: 'Stock Adjusted', details });
        setIsFormDialogOpen(false);
        setSelectedItem(null);
        fetchItems(); // Refetch data
    } else if (adjustState.type === 'error') {
        toast({ variant: 'destructive', title: 'Error', description: adjustState.message });
    }
  }, [adjustState, toast, addAuditLog]);


  const availableSchools = useMemo(() => {
    if (filterDistrict === 'All') {
      return ["All", ...initialSchools.map(s => s.name)];
    }
    return ["All", ...initialSchools.filter(s => s.district === filterDistrict).map(s => s.name)];
  }, [filterDistrict]);

  const filteredFoodItems = useMemo(() => {
    return foodItems.filter(item => {
      const districtMatch = filterDistrict === 'All' || item.district === filterDistrict;
      const schoolMatch = filterSchool === 'All' || item.school === filterSchool;
      return districtMatch && schoolMatch;
    });
  }, [foodItems, filterDistrict, filterSchool]);

  const stockMetrics = useMemo(() => {
    const totalItems = filteredFoodItems.length;
    const totalQuantity = filteredFoodItems.reduce((sum, item) => sum + item.stock, 0);
    const lowStockItemsCount = filteredFoodItems.filter(item => item.stock < LOW_STOCK_THRESHOLD).length;
    
    let mostStocked = null;
    if(filteredFoodItems.length > 0) {
        mostStocked = filteredFoodItems.reduce((max, item) => item.stock > max.stock ? item : max, filteredFoodItems[0]);
    }

    return { totalItems, totalQuantity, lowStockItemsCount, mostStocked };
  }, [filteredFoodItems]);
  
  const paginatedFoodItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFoodItems.slice(startIndex, endIndex);
  }, [filteredFoodItems, currentPage]);

  const totalPages = Math.ceil(filteredFoodItems.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterSchool]);


  const handleDistrictChange = (district: string) => {
    setFilterDistrict(district);
    setFilterSchool('All');
  }

  const handleAdjustClick = (item: FoodItem) => {
    setSelectedItem(item);
    setIsFormDialogOpen(true);
  }

  const handleDialogChange = (open: boolean) => {
    setIsFormDialogOpen(open);
    if (!open) {
      setSelectedItem(null);
    }
  }


  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Item Types</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stockMetrics.totalItems}</div>
                    <p className="text-xs text-muted-foreground">Distinct food items in stock</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stockMetrics.totalQuantity.toLocaleString()}</div>
                     <p className="text-xs text-muted-foreground">Total units across all items</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{stockMetrics.lowStockItemsCount}</div>
                    <p className="text-xs text-muted-foreground">Items below threshold</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Stocked Item</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate">{stockMetrics.mostStocked?.name || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">
                        {stockMetrics.mostStocked ? `${stockMetrics.mostStocked.stock.toLocaleString()} units` : '-'}
                    </p>
                </CardContent>
            </Card>
        </div>

        <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Stock Tracking</CardTitle>
                    <CardDescription>Monitor and adjust food item inventory levels across schools.</CardDescription>
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
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">School</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Stock Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading
                     ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                    : paginatedFoodItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="hidden sm:table-cell">{item.school}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                           <div className='flex justify-end items-center gap-2'>
                           {item.stock < LOW_STOCK_THRESHOLD && <Badge variant="destructive">Low Stock</Badge>}
                            <span>{item.stock}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleAdjustClick(item)}>
                                Adjust Stock
                            </Button>
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

        <Dialog open={isFormDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Adjust Stock for {selectedItem?.name}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
                <StockAdjustmentForm
                    foodItem={selectedItem}
                    formAction={adjustFormAction}
                    isPending={isAdjustPending}
                />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

    