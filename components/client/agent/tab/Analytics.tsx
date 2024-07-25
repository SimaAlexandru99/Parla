// components/dashboard/Agent/AnalyticsTab.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AgentMetrics } from '@/types/AgentMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsTabProps {
    metrics: AgentMetrics | null;
    t: any;
}

const AnalyticsTab = ({ metrics, t }: AnalyticsTabProps) => {
    if (!metrics) return <p>Loading metrics...</p>;

    return (
        <Card className="grid gap-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">{t.agent_page.overview.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t.agent_page.overview.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-start">
                <h3>Average Sentiment</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={metrics.sentimentData}>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
                <p>{`Average Sentiment: ${metrics.avgSentiment.toFixed(2)}`}</p>
                <div className="flex flex-col items-start">
                    <h3>Total Dead Air Duration (Speaker 00)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={metrics.deadAirData}>
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                    <p>{`Total Dead Air Duration: ${metrics.totalDeadAirSpeaker00} seconds`}</p>
                </div>
                <div className="flex flex-col items-start">
                    <h3>Total Talk Duration (Speaker 00)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={metrics.talkDurationData}>
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#ffc658" />
                        </LineChart>
                    </ResponsiveContainer>
                    <p>{`Total Talk Duration: ${metrics.totalTalkDurationSpeaker00} seconds`}</p>
                </div>
            </CardContent>

        </Card>
    );
};

export default AnalyticsTab;