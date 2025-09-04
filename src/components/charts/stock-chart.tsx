
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  stock: {
    label: 'Stock (kg)',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

type StockChartProps = {
    data: { item: string; stock: number }[];
};

export function StockChart({ data }: StockChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.map(d => ({...d, item: d.name}))}
          layout="vertical"
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="item"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="stock" fill="var(--color-stock)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
