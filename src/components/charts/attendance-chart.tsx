
'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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

type AttendanceChartProps = {
    data: { day: string; male: number, female: number }[];
};

export function AttendanceChart({ data }: AttendanceChartProps) {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 0,
                    }}
                >
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={[85, 100]} tickFormatter={(value) => `${value}%`}/>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                        dataKey="male"
                        type="monotone"
                        stroke="var(--color-male)"
                        strokeWidth={2}
                        dot={true}
                    />
                     <Line
                        dataKey="female"
                        type="monotone"
                        stroke="var(--color-female)"
                        strokeWidth={2}
                        dot={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
