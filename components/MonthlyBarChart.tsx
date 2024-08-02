// components/common/MonthlyBarChart.tsx
import React from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltipContent, ChartConfig, ChartTooltip } from "@/components/ui/chart";
import { useLanguage } from "@/contexts/client/LanguageContext";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--accent))",
    },
} satisfies ChartConfig;

interface MonthlyData {
    month: number;
    count: number;
}

interface MonthlyBarChartProps {
    loading: boolean;
    monthlyData: MonthlyData[];
}

const monthNamesInRomanian = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sept", "Oct", "Noi", "Dec"];

const SkeletonBarChart = () => (
    <div className="animate-pulse">
        <Skeleton className="h-[450px] w-full" />
        <div className="flex justify-between mt-2">
            {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-8" />
            ))}
        </div>
    </div>
);

const MonthlyBarChart = ({ loading, monthlyData }: MonthlyBarChartProps) => {
    const { t } = useLanguage();

    return (
        <Card className="">
            <CardHeader className="p-6">
                <CardTitle className="font-semibold leading-none tracking-tight">{t.monthlyBarChart.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {loading ? (
                    <SkeletonBarChart />
                ) : (
                    <ChartContainer config={chartConfig}>
                        <BarChart width={500} height={300} data={monthlyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => monthNamesInRomanian[value - 1] || value}
                            />
                            <YAxis domain={[0, Math.max(...monthlyData.map(d => d.count))]} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="count" fill="var(--color-desktop)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default MonthlyBarChart;
