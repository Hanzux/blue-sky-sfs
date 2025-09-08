
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { generateReportSummary, type GenerateReportSummaryOutput } from '@/ai/flows/generate-report-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';
import { Input } from './ui/input';
import { format } from 'date-fns';

const keyMetrics = [
    { value: 'overall_attendance', label: 'Overall Attendance' },
    { value: 'meal_service_efficiency', label: 'Meal Service Efficiency' },
    { value: 'stock_levels', label: 'Stock Levels' },
    { value: 'enrollment_trends', label: 'Learner Enrollment Trends' },
];

export function ReportingTool() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 20)),
    to: new Date(),
  });
  const [groupBy, setGroupBy] = useState('school');
  const [keyMetric, setKeyMetric] = useState(keyMetrics[0].value);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateReportSummaryOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (!date?.from || !date?.to) {
        throw new Error('Please select a valid date range.');
      }
      const summary = await generateReportSummary({
        reportData: 'Sample report data including learner attendance and meals served.',
        reportType: 'Termly',
        dateRange: `${date.from.toDateString()} to ${date.to.toDateString()}`,
        userRole: 'Project Coordinator',
        screenContext: `Dashboard reporting tool, grouped by ${groupBy}.`,
        keyMetric: keyMetric,
      });
      setResult(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Summary',
        description: 'There was a problem generating the report. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="font-headline">Simplified Reporting Tool</CardTitle>
          <CardDescription>Generate a summary of key metrics over a selected date range.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="grid gap-2 mr-4">
            <Label>Date Range</Label>
            <div className="flex items-center gap-2">
                <Input
                    type="date"
                    value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setDate(prev => ({...prev, from: e.target.valueAsDate || undefined}))}
                />
                <span>to</span>
                 <Input
                    type="date"
                    value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setDate(prev => ({...prev, to: e.target.valueAsDate || undefined}))}
                />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="group-by">Group By</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger id="group-by" className="w-full">
                <SelectValue placeholder="Select how to group data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="class">Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key-metric">Key Metric</Label>
            <Select value={keyMetric} onValueChange={setKeyMetric}>
              <SelectTrigger id="key-metric" className="w-full">
                <SelectValue placeholder="Select a key metric" />
              </SelectTrigger>
              <SelectContent>
                {keyMetrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                        {metric.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </CardFooter>
      </form>
      {loading && (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardContent>
      )}
      {result && (
        <CardContent>
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Bot className="w-5 h-5 text-accent"/>
                        AI Generated Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80">{result.summary}</p>
                </CardContent>
            </Card>
        </CardContent>
      )}
    </Card>
  );
}
