
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', learners: 186 },
  { month: 'February', learners: 305 },
  { month: 'March', learners: 237 },
  { month: 'April', learners: 173 },
  { month: 'May', learners: 209 },
  { month: 'June', learners: 214 },
];

const chartConfig = {
  learners: {
    label: 'Learners',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function EnrollmentChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="learners" fill="var(--color-learners)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
