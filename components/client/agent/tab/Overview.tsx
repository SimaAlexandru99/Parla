import React from 'react';
import { AgentDetails } from '@/types/PropsTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataCard, SkeletonCard } from '@/components/Cards';
import AgentScoreChart from '@/components/client/agent/info/score-chart';
import AgentSummaryCard from '@/components/client/agent/info/summary-card';

interface AgentOverviewTabProps {
  agentDetails: AgentDetails | null;
  loading: boolean;
  cardsData: any[];
  scoreData: { month: string; score: number }[];
  scoreTrend: { percentage: number; trending: 'up' | 'down' | 'neutral' };
  t: any;
  language: string;
  companyData: string | undefined;
  recordingCount: number;
  percentageChange: string;
  averageAudioDuration: string;
  averageScore: number;
  averageProcessingTime: string;
}


const AgentOverviewTab = ({
  agentDetails,
  loading,
  cardsData,
  scoreData,
  scoreTrend,
  t,
  language,
  companyData,
  recordingCount,
  percentageChange,
  averageAudioDuration,
  averageScore,
  averageProcessingTime
}: AgentOverviewTabProps) => {
  if (!agentDetails) return null;

  return (
    <Card className="w-full bg-transparent border-none py-">
      <CardHeader className="flex flex-row items-center justify-between space-y-0  px-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t.agent_page.overview.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{t.agent_page.overview.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="lg:grid-cols-4 gap-4 px-0">
        <div className="grid gap-4 md:grid-cols-2 mb-4 md:gap-6 lg:grid-cols-4">
          {loading
            ? [...Array(4)].map((_, index) => (
                <SkeletonCard key={index} className="" />
              ))
            : cardsData.map((card: any, index: number) => (
                <div key={index} className="transform transition-all duration-300 ease-in-out hover:scale-105">
                  <DataCard
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    change={card.change}
                    loading={card.loading}
                  />
                </div>
              ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <AgentScoreChart scoreData={scoreData} scoreTrend={scoreTrend} loading={loading} />
          <AgentSummaryCard
            t={t}
            language={language}
            agentDetails={agentDetails}
            companyDatabase={companyData}
            recordingCount={recordingCount}
            percentageChange={percentageChange}
            averageAudioDuration={averageAudioDuration}
            averageScore={averageScore}
            averageProcessingTime={averageProcessingTime}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentOverviewTab;