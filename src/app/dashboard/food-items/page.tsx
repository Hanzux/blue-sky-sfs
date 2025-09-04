
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { FoodItemForm } from '@/components/food-item-form';
import { initialFoodItems, type FoodItem, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const ITEMS_PER_PAGE = 5;

export default function FoodItemsPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | undefined>(undefined);
  const [viewingItem, setViewingItem] = useState<FoodItem | undefined>(undefined);
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [filterSchool, setFilterSchool] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleAddItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem = { ...item, id: (foodItems.length + 1).toString() };
    setFoodItems([...foodItems, newItem]);
    setIsFormDialogOpen(false);
  };
  
  const handleUpdateItem = (item: FoodItem) => {
    setFoodItems(foodItems.map(i => i.id === item.id ? item : i));
    setEditingItem(undefined);
    setIsFormDialogOpen(false);
  }

  const handleDeleteItem = (id: string) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };
  
  const handleViewClick = (item: FoodItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  }

  const handleEditClick = (item: FoodItem) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
  }

  const handleFormDialogClose = (open: boolean) => {
    if (!open) {
      setEditingItem(undefined);
    }
    setIsFormDialogOpen(open);
  }

  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-6xl">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Food Items</CardTitle>
                    <CardDescription>Manage the list of food items used in the feeding program.</CardDescription>
                </div>
                <Dialog open={isFormDialogOpen} onOpenChange={handleFormDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" />
                            New Food Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</DialogTitle>
                        </DialogHeader>
                        <FoodItemForm 
                            onSubmit={editingItem ? handleUpdateItem : handleAddItem} 
                            foodItem={editingItem}
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
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">District</TableHead>
                    <TableHead className="hidden sm:table-cell">School</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedFoodItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="hidden sm:table-cell">{item.district}</TableCell>
                        <TableCell className="hidden sm:table-cell">{item.school}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewClick(item)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>Delete</DropdownMenuItem>
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
                    <DialogTitle>View Food Item</DialogTitle>
                    <DialogDescription>Details for {viewingItem?.name}.</DialogDescription>
                </DialogHeader>
                {viewingItem && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <div className="col-span-3">{viewingItem.name}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Category</Label>
                            <div className="col-span-3">{viewingItem.category}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">District</Label>
                            <div className="col-span-3">{viewingItem.district || '-'}</div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">School</Label>
                            <div className="col-span-3">{viewingItem.school || '-'}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Unit</Label>
                            <div className="col-span-3">{viewingItem.unit}</div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Stock</Label>
                            <div className="col-span-3">{viewingItem.stock}</div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}

    