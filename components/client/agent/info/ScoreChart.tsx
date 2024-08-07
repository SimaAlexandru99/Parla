import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/client/LanguageContext";

interface AgentScoreChartProps {
    scoreData: { month: string; score: number }[];
    scoreTrend: { percentage: number; trending: 'up' | 'down' | 'neutral' };
    loading: boolean;
}

const chartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--accent))",
    },
} satisfies ChartConfig;

const AgentScoreChart = ({ scoreData, scoreTrend, loading }: AgentScoreChartProps) => {
    const { t } = useLanguage();

    if (loading) {
        return (
            <Card className=" w-full">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[160px] w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-4 w-full" />
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className=" w-full">
            <CardHeader>
                <CardTitle>{t.agentScoreChart.title}</CardTitle>
                <CardDescription>
                    {t.agentScoreChart.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        data={scoreData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Area type="monotone" dataKey="score" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.3} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {scoreTrend.trending === 'up'
                                ? t.agentScoreChart.trendingUp
                                : scoreTrend.trending === 'down'
                                    ? t.agentScoreChart.trendingDown
                                    : t.agentScoreChart.noChange}
                            {t.agentScoreChart.byPercentage.replace('{percentage}', scoreTrend.percentage.toFixed(1))}
                            {scoreTrend.trending === 'up' ? <TrendingUp className="h-4 w-4" /> : scoreTrend.trending === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            {scoreData.length > 0 ? `${scoreData[0].month} - ${scoreData[scoreData.length - 1].month}` : t.agentScoreChart.noDataAvailable}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export default AgentScoreChart;