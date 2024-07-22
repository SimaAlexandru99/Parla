import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig, ChartTooltip } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TalkRatioChartProps {
    repDuration: number;
    customerDuration: number;
    deadAirDuration: number;
    crosstalkDuration: number;
    totalDuration: number;
    title: string;
}

const TalkRatioChart = ({
    repDuration,
    customerDuration,
    deadAirDuration,
    crosstalkDuration,
    totalDuration,
    title,
}: TalkRatioChartProps) => {
    const chartData = useMemo(() => {
        const calculatePercentage = (duration: number) => (duration / totalDuration) * 100;

        return [
            {
                talk_ratio: 'Rep',
                percentage: calculatePercentage(repDuration),
                duration: repDuration,
                fill: "hsl(var(--chart-1))"
            },
            {
                talk_ratio: 'Customer',
                percentage: calculatePercentage(customerDuration),
                duration: customerDuration,
                fill: "hsl(var(--chart-2))"
            },
            {
                talk_ratio: 'Dead Air',
                percentage: calculatePercentage(deadAirDuration),
                duration: deadAirDuration,
                fill: "hsl(var(--chart-3))"
            },
            {
                talk_ratio: 'Crosstalk',
                percentage: calculatePercentage(crosstalkDuration),
                duration: crosstalkDuration,
                fill: "hsl(var(--chart-5))"
            }
        ];
    }, [repDuration, customerDuration, deadAirDuration, crosstalkDuration, totalDuration]);

    const chartConfig = {
        Rep: {
            label: "Rep",
            color: "hsl(var(--chart-1))"
        },
        Customer: {
            label: "Customer",
            color: "hsl(var(--chart-2))"
        },
        "Dead Air": {
            label: "Dead Air",
            color: "hsl(var(--chart-3))"
        },
        Crosstalk: {
            label: "Crosstalk",
            color: "hsl(var(--chart-5))"
        },
    } satisfies ChartConfig;

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1">
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <YAxis
                                dataKey="talk_ratio"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                width={80}
                            />
                            <XAxis
                                type="number"
                                hide
                                domain={[0, 100]}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="percentage" layout="vertical" radius={[0, 4, 4, 0]}>
                                <LabelList
                                    dataKey="percentage"
                                    position="right"
                                    formatter={(value: number) => `${value.toFixed(1)}%`}
                                    fill="hsl(var(--foreground))"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    {chartData.map((item) => (
                        <div key={item.talk_ratio} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <span>{item.talk_ratio}</span>
                            </div>
                            <span className="font-medium">{formatDuration(item.duration)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TalkRatioChart;