import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip } from "@/components/ui/chart";

interface WordFrequencyChartProps {
    wordFrequencyData: Array<{ name: string; size: number }>;
    title: string;
}

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const WordFrequencyChart = ({ wordFrequencyData, title }: WordFrequencyChartProps) => {
    const chartConfig = {
        word: {
            label: "Word",
            color: "hsl(var(--chart-1))"
        },
        frequency: {
            label: "Frequency",
            color: "hsl(var(--chart-2))"
        },
        percentage: {
            label: "Percentage",
            color: "hsl(var(--chart-3))"
        }
    } satisfies ChartConfig;

    const processedData = useMemo(() => {
        const filteredData = wordFrequencyData.filter(item => item.size >= 5);
        const total = filteredData.reduce((sum, item) => sum + item.size, 0);
        return filteredData.map((item, index) => ({
            ...item,
            percentage: (item.size / total) * 100,
            fill: COLORS[index % COLORS.length]
        }));
    }, [wordFrequencyData]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-background border border-border p-3 rounded-lg shadow-md">
                    <p className="font-semibold text-lg mb-2">{data.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-sm text-muted-foreground">{chartConfig.frequency.label}</p>
                            <p className="font-medium">{data.size}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{chartConfig.percentage.label}</p>
                            <p className="font-medium">{data.percentage.toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={400}>
                        <Treemap
                            data={processedData}
                            dataKey="size"
                            aspectRatio={4 / 3}
                            stroke="hsl(var(--background))"
                            fill="hsl(var(--chart-1))"
                        >
                            <ChartTooltip
                                cursor={false}
                                content={<CustomTooltip />}
                            />
                        </Treemap>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {processedData.map((item, index) => (
                        <div key={item.name} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-sm">{item.name}: {item.size}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default WordFrequencyChart;