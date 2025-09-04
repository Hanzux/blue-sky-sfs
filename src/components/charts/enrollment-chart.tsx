
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const chartConfig = {
  male: {
    label: 'Male',
    color: 'hsl(var(--chart-2))',
  },
  female: {
    label: 'Female',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type EnrollmentChartProps = {
    data: { month: string; male: number; female: number }[];
};

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
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
           <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="female" fill="var(--color-female)" radius={4} stackId="a" />
          <Bar dataKey="male" fill="var(--color-male)" radius={4} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
