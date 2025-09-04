
'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart';

const chartData = [
  { meal: 'Breakfast', servings: 1250, fill: 'var(--color-breakfast)' },
  { meal: 'Lunch', servings: 1181, fill: 'var(--color-lunch)' },
];

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

export function MealsChart() {
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
            data={chartData}
            dataKey="servings"
            nameKey="meal"
            innerRadius={60}
            strokeWidth={5}
          />
          <ChartLegend
            content={<ChartLegendContent nameKey="meal" />}
            className="-translate-y-[2px] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
