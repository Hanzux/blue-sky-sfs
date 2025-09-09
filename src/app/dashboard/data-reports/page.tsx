
'use client';

import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { initialLearners, initialSchools, initialFoodItems } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { useAuditLog } from '@/contexts/audit-log-context';

const reportTypes = [
    { value: 'attendance', label: 'Attendance by District/School' },
    { value: 'attendance_analysis', label: 'Attendance Analysis (Above/Below 80%)' },
    { value: 'meals', label: 'Meals Served by District/School' },
    { value: 'stock', label: 'Stock Levels by District/School' },
    { value: 'trends', label: 'Learner Trends Analysis' },
];

const districts = ["All", ...new Set(initialSchools.map(school => school.district))];

export default function DataReportsPage() {
    const { addAuditLog } = useAuditLog();
    const [reportType, setReportType] = useState(reportTypes[0].value);
    const [filterDistrict, setFilterDistrict] = useState('All');
    const [filterSchool, setFilterSchool] = useState('All');
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);

    const availableSchools = useMemo(() => {
        if (filterDistrict === 'All') {
          return ["All", ...initialSchools.map(s => s.name)];
        }
        return ["All", ...initialSchools.filter(s => s.district === filterDistrict).map(s => s.name)];
    }, [filterDistrict]);

    const handleDistrictChange = (district: string) => {
        setFilterDistrict(district);
        setFilterSchool('All');
        setPreviewData([]);
        setPreviewHeaders([]);
    }

    const handleSchoolChange = (school: string) => {
        setFilterSchool(school);
        setPreviewData([]);
        setPreviewHeaders([]);
    }

    const generateReportData = () => {
        let data: any[] = [];
        let headers: string[] = [];

        const learners = initialLearners.filter(l => 
            (filterDistrict === 'All' || l.district === filterDistrict) && 
            (filterSchool === 'All' || l.school === filterSchool)
        );

        const foodItems = initialFoodItems.filter(i => 
            (filterDistrict === 'All' || i.district === filterDistrict) && 
            (filterSchool === 'All' || i.school === filterSchool)
        );

        switch (reportType) {
            case 'attendance':
                headers = ['Learner Name', 'Gender', 'Class', 'School', 'District', 'Status'];
                data = learners.map(l => ({ 
                    name: l.name,
                    gender: l.gender,
                    className: l.className,
                    school: l.school,
                    district: l.district,
                    status: Math.random() > 0.1 ? 'Present' : 'Absent' 
                }));
                break;
            case 'attendance_analysis':
                headers = ['Class', 'Gender', 'Attendance > 80%', 'Attendance < 80%'];
                const analysis: Record<string, { maleAbove: number, maleBelow: number, femaleAbove: number, femaleBelow: number }> = {};
                
                learners.forEach(l => {
                    if (!analysis[l.className]) {
                        analysis[l.className] = { maleAbove: 0, maleBelow: 0, femaleAbove: 0, femaleBelow: 0 };
                    }
                    const attendanceRate = Math.random() * 30 + 70; // Simulate rate between 70-100
                    if (l.gender === 'Male') {
                        if (attendanceRate >= 80) analysis[l.className].maleAbove++;
                        else analysis[l.className].maleBelow++;
                    } else {
                        if (attendanceRate >= 80) analysis[l.className].femaleAbove++;
                        else analysis[l.className].femaleBelow++;
                    }
                });

                Object.entries(analysis).forEach(([className, stats]) => {
                    if (stats.maleAbove > 0 || stats.maleBelow > 0) {
                        data.push({
                            className,
                            gender: 'Male',
                            above80: stats.maleAbove,
                            below80: stats.maleBelow,
                        });
                    }
                    if (stats.femaleAbove > 0 || stats.femaleBelow > 0) {
                        data.push({
                            className,
                            gender: 'Female',
                            above80: stats.femaleAbove,
                            below80: stats.femaleBelow,
                        });
                    }
                });
                break;
            case 'meals':
                headers = ['Learner Name', 'Gender', 'Class', 'School', 'Breakfast', 'Lunch'];
                data = learners.map(l => ({ 
                    name: l.name,
                    gender: l.gender,
                    className: l.className,
                    school: l.school,
                    breakfast: Math.random() > 0.05 ? 'Served' : 'Not Served',
                    lunch: Math.random() > 0.02 ? 'Served' : 'Not Served'
                }));
                break;
            case 'stock':
                headers = ['Item Name', 'Category', 'Unit', 'Stock', 'School', 'District'];
                data = foodItems.map(item => ({
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    stock: item.stock,
                    school: item.school,
                    district: item.district,
                }));
                break;
            case 'trends':
                headers = ['Learner Name', 'Gender', 'Class', 'Attendance Rate (%)', 'Meals Served (%)'];
                data = learners.map(l => ({
                    name: l.name,
                    gender: l.gender,
                    className: l.className,
                    attendanceRate: (Math.random() * 15 + 85).toFixed(1),
                    mealsServed: (Math.random() * 10 + 90).toFixed(1),
                }));
                break;
        }
        return { data, headers };
    }

    const handlePreview = () => {
        const { data, headers } = generateReportData();
        setPreviewData(data);
        setPreviewHeaders(headers);
        const reportLabel = reportTypes.find(r => r.value === reportType)?.label;
        addAuditLog({ action: 'Report Previewed', details: `Previewed "${reportLabel}" report.` });
    }
    
    const handleExport = () => {
        const { data, headers } = generateReportData();
        if (data.length === 0) return;

        const doc = new jsPDF();
        
        const reportTitle = reportTypes.find(r => r.value === reportType)?.label || 'Report';
        const filterSubTitle = `District: ${filterDistrict} | School: ${filterSchool}`;

        doc.setFontSize(18);
        doc.text(reportTitle, 14, 22);
        doc.setFontSize(11);
        doc.text(filterSubTitle, 14, 30);

        (doc as any).autoTable({
            startY: 35,
            head: [headers],
            body: data.map(row => Object.values(row)),
        });

        doc.save(`${reportType}_report.pdf`);
        addAuditLog({ action: 'Report Exported', details: `Exported "${reportTitle}" report as PDF.` });
    }

    return (
        <div className="flex justify-center">
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Data Reports</CardTitle>
                <CardDescription>Generate, preview, and export detailed reports in PDF format.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {reportTypes.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>District</Label>
                    <Select value={filterDistrict} onValueChange={handleDistrictChange}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>School</Label>
                    <Select value={filterSchool} onValueChange={handleSchoolChange}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>{availableSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="gap-4">
                <Button onClick={handlePreview}>Preview Report</Button>
                <Button variant="outline" onClick={handleExport} disabled={previewData.length === 0}>
                    <Download className="mr-2"/>
                    Export to PDF
                </Button>
            </CardFooter>

            {previewData.length > 0 && (
                <CardContent>
                    <CardTitle className="text-lg mb-4">Report Preview</CardTitle>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {previewHeaders.map(h => <TableHead key={h}>{h}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Object.values(row).map((cell: any, cellIndex: number) => (
                                            <TableCell key={`${rowIndex}-${cellIndex}`}>
                                                {cell}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            )}
        </Card>
        </div>
    );
}
