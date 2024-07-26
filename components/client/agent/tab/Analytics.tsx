"use client"

import React from 'react';
import { PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown } from "lucide-react";
import { AgentMetrics } from '@/types/AgentMetrics';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AnalyticsTabProps {
    metrics: AgentMetrics | null;
    t: any;
}

const chartConfig: ChartConfig = {
  sentiment: {
    label: "Sentiment",
  },
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))",
  },
  duration: {
    label: "Duration",
  },
  deadAir: {
    label: "Dead Air",
    color: "hsl(var(--chart-3))",
  },
  talkDuration: {
    label: "Talk Duration",
    color: "hsl(var(--chart-4))",
  },
};

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ metrics, t }) => {
    if (!metrics) return <p>Loading metrics...</p>;

    const sentimentData = [
        { name: 'Positive', value: Math.max(metrics.avgSentiment, 0), fill: chartConfig.positive.color },
        { name: 'Negative', value: Math.max(-metrics.avgSentiment, 0), fill: chartConfig.negative.color },
    ];

    const durationData = [
        { name: 'Dead Air', value: metrics.totalDeadAirSpeaker00, fill: chartConfig.deadAir.color },
        { name: 'Talk Duration', value: metrics.totalTalkDurationSpeaker00, fill: chartConfig.talkDuration.color },
    ];

    const renderPieChart = (data: any[], title: string, config: ChartConfig) => (
        <Card className="flex flex-col bg-background">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{t.agent_page.overview.timeframe}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={data} dataKey="value" nameKey="name" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {data[0].value > data[1].value ? (
                        <>
                            Trending up <TrendingUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Trending down <TrendingDown className="h-4 w-4" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    {t.agent_page.overview.description}
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {renderPieChart(sentimentData, t.agent_page.overview.sentiment, chartConfig)}
            {renderPieChart(durationData, t.agent_page.overview.duration, chartConfig)}
        </div>
    );
};

export default AnalyticsTab;