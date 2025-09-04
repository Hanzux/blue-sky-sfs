
'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartData = [
    { day: 'Mon', rate: 88.2 },
    { day: 'Tue', rate: 91.5 },
    { day: 'Wed', rate: 93.1 },
    { day: 'Thu', rate: 90.3 },
    { day: 'Fri', rate: 94.6 },
    { day: 'Sat', rate: 92.8 },
    { day: 'Sun', rate: 89.9 },
];

const chartConfig = {
    rate: {
        label: 'Attendance Rate',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

export function AttendanceChart() {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={chartData}
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
