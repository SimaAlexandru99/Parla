'use client'
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
interface CallDurationDistributionProps {
    repDuration: number;
    customerDuration: number;
    totalDuration: number;
    title: string;
}

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
    label: {
        color: "hsl(var(--background))",
    },
} satisfies ChartConfig

const CallDurationDistribution = ({ repDuration, customerDuration, totalDuration, title }: CallDurationDistributionProps) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Example data fetching logic
        const fetchData = async () => {
            setLoading(true);
            try {
                // Simulated data
                const fetchedData = [
                    { range: '0-1 min', count: repDuration },
                    { range: '1-2 min', count: customerDuration },
                    { range: '2-3 min', count: totalDuration }
                ];
                const filteredData = fetchedData.filter(item => item.count > 0);
                setData(filteredData);
            } catch (error) {
                console.error('Failed to fetch call duration data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [repDuration, customerDuration, totalDuration]);

    return (
        <Card className="w-full">
            <CardHeader className="p-6">
                {loading ? (
                    <Skeleton className="h-6 w-1/3" />
                ) : (
                    <CardTitle className="font-semibold leading-none tracking-tight">
                        {title}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent className="flex justify-center h-96 p-6">
                {loading ? (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-5/6 mb-4" />
                        <Skeleton className="h-6 w-2/3 mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-5/6 mb-4" />
                        <Skeleton className="h-6 w-2/3 mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-6 w-5/6 mb-4" />
                    </div>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <BarChart data={data} layout="vertical" margin={{ right: 16 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="range"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                reversed
                                tickFormatter={(value) => value.slice(0, 3)}
                                hide
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Bar dataKey="count" fill="var(--color-desktop)" radius={4}>
                                <LabelList
                                    dataKey="range"
                                    position="insideLeft"
                                    offset={8}
                                    className="fill-[--color-label]"
                                    fontSize={12}
                                />
                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default CallDurationDistribution;
