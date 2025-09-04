
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { initialFoodItems, type FoodItem, initialSchools } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];
const LOW_STOCK_THRESHOLD = 30;
const ITEMS_PER_PAGE = 5;

export default function StockTrackingPage() {
  const [foodItems] = useState<FoodItem[]>(initialFoodItems);
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

  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-6xl">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Stock Tracking</CardTitle>
                    <CardDescription>Monitor food item inventory levels across schools.</CardDescription>
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
                    <TableHead className="hidden sm:table-cell">District</TableHead>
                    <TableHead className="hidden sm:table-cell">School</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Stock Level</TableHead>
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
                        <TableCell className="text-right">
                           <div className='flex justify-end items-center gap-2'>
                           {item.stock < LOW_STOCK_THRESHOLD && <Badge variant="destructive">Low Stock</Badge>}
                            <span>{item.stock}</span>
                           </div>
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
    </div>
  );
}

    