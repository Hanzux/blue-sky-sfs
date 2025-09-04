
'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
    rate: {
        label: 'Attendance Rate',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

type AttendanceChartProps = {
    data: { day: string; rate: number }[];
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
                    <Line
                        dataKey="rate"
                        type="monotone"
                        stroke="var(--color-rate)"
                        strokeWidth={2}
                        dot={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
