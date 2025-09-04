
'use client';

import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart';

const chartConfig = {
  servings: {
    label: 'Servings',
  },
  breakfast: {
    label: 'Breakfast',
    color: 'hsl(var(--chart-1))',
  },
  lunch: {
    label: 'Lunch',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

type MealsChartProps = {
    data: { meal: string; servings: number; fill: string }[];
};

export function MealsChart({ data }: MealsChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="servings"
            nameKey="meal"
            innerRadius={60}
            strokeWidth={5}
          />
          <ChartLegend
            content={<ChartLegendContent nameKey="meal" />}
            className="-translate-y-[2px] flex-wrap gap-2 text-foreground [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
