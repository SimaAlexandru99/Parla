'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLanguage } from "@/contexts/client/LanguageContext";
import { useTheme } from "next-themes";
import { AgentDetails, CallDetails } from '@/types/PropsTypes';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Clock, Award, Timer } from 'lucide-react';
import {
    fetchAgentMetrics,
    checkMongoConnection,
    fetchRecordingCounts,
    fetchAverageAudioDuration,
    fetchAverageScore,
    fetchAverageProcessingTime,
    fetchAgentScores,
    fetchAgentSummary,
    fetchCalls,
    deleteCall
} from '@/lib/apiClient';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import ProjectOverviewTab from '@/components/client/agent/tab/Overview';
import AgentActivityTab from '@/components/client/agent/tab/Activity';
import AnalyticsTab from '@/components/client/agent/tab/Analytics';

interface AgentDetailsClientProps {
    initialAgent: AgentDetails;
    initialMetrics: any;
}

const AgentDetailsClient = ({ initialAgent, initialMetrics }: AgentDetailsClientProps) => {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [agent] = useState<AgentDetails>(initialAgent);
    const [metrics, setMetrics] = useState<any>(initialMetrics);
    const [connectionStatus, setConnectionStatus] = useState('Checking connection...');
    const [loading, setLoading] = useState(true);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [recordingCount, setRecordingCount] = useState<number | null>(null);
    const [percentageChange, setPercentageChange] = useState<string | null>(null);
    const [averageAudioDuration, setAverageAudioDuration] = useState<string | null>(null);
    const [averageScore, setAverageScore] = useState<number | null>(null);
    const [audioDurationChange, setAudioDurationChange] = useState<string | null>(null);
    const [averageScoreChange, setAverageScoreChange] = useState<string | null>(null);
    const [averageProcessingTime, setAverageProcessingTime] = useState<string | null>(null);
    const [processingTimeChange, setProcessingTimeChange] = useState<string | null>(null);
    const [scoreData, setScoreData] = useState<{ month: string; score: number }[]>([]);
    const [scoreTrend, setScoreTrend] = useState<{ percentage: number; trending: 'up' | 'down' | 'neutral' }>({ percentage: 0, trending: 'neutral' });
    const [agentSummary, setAgentSummary] = useState('');
    const [, setCallDetailsDrawerOpen] = useState(false);
    const [, setSelectedCall] = useState<CallDetails | null>(null);
    const [calls, setCalls] = useState<CallDetails[]>([]);
    const [callsLoading, setCallsLoading] = useState(true);
    const [page] = useState(1);
    const [, setTotalCalls] = useState(0);
    const limitPerPage = 10;

    const calculatePercentageChange = useCallback((currentCount: number, lastMonthCount: number) => {
        if (lastMonthCount > 0) {
            const change = ((currentCount - lastMonthCount) / lastMonthCount) * 100;
            setPercentageChange(`${change.toFixed(2)}% ${change >= 0 ? 'more' : 'fewer'} processed`);
        } else {
            setPercentageChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [t.overviewTab.handleInfoNotExist]);

    const calculateAudioDurationChange = useCallback((currentDuration: number, lastDuration: number) => {
        if (lastDuration > 0) {
            const change = ((currentDuration - lastDuration) / lastDuration) * 100;
            setAudioDurationChange(`${change.toFixed(2)}% ${change >= 0 ? 'longer' : 'shorter'}`);
        } else {
            setAudioDurationChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [t.overviewTab.handleInfoNotExist]);

    const calculateAverageScoreChange = useCallback((currentScore: number, lastScore: number) => {
        if (lastScore > 0) {
            const change = ((currentScore - lastScore) / lastScore) * 100;
            setAverageScoreChange(`${change.toFixed(2)}% ${change >= 0 ? 'higher' : 'lower'}`);
        } else {
            setAverageScoreChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [t.overviewTab.handleInfoNotExist]);

    const calculateProcessingTimeChange = useCallback((currentTime: number, lastTime: number) => {
        if (lastTime > 0) {
            const change = ((currentTime - lastTime) / lastTime) * 100;
            setProcessingTimeChange(`${change.toFixed(2)}% ${change >= 0 ? 'longer' : 'shorter'}`);
        } else {
            setProcessingTimeChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [t.overviewTab.handleInfoNotExist]);

    const calculateScoreTrend = useCallback((scores: { month: string; score: number }[]) => {
        if (scores.length >= 2) {
            const lastScore = scores[scores.length - 1].score;
            const previousScore = scores[scores.length - 2].score;
            const change = ((lastScore - previousScore) / previousScore) * 100;
            setScoreTrend({
                percentage: Math.abs(change),
                trending: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
            });
        }
    }, []);

    const handleConnectionError = useCallback((error: unknown) => {
        if (error instanceof Error) {
            setConnectionStatus(`${t.overviewTab.handleConnectionError} ${error.message}`);
        } else {
            setConnectionStatus(`${t.overviewTab.handleConnectionUnknownError}`);
        }
    }, [t.overviewTab.handleConnectionError, t.overviewTab.handleConnectionUnknownError]);

    const fetchSummary = useCallback(async () => {
        if (!agent || !companyData?.database) return;

        try {
            const summary = await fetchAgentSummary(
                companyData.database,
                `${agent.first_name} ${agent.last_name}`,
                agent.username,
                language,
                recordingCount || 0,
                percentageChange || '',
                averageAudioDuration || '',
                averageScore || 0,
                averageProcessingTime || ''
            );

            setAgentSummary(summary.summary);
        } catch (error) {
            console.error('Error fetching agent summary:', error);
            setAgentSummary('Failed to generate agent summary.');
        }
    }, [agent, companyData?.database, language, recordingCount, percentageChange, averageAudioDuration, averageScore, averageProcessingTime]);

    const refetchData = useCallback(async () => {
        if (!companyData?.database || !agent) return;

        try {
            const mongoConnection = await checkMongoConnection();
            setConnectionStatus(mongoConnection.status);

            if (mongoConnection.status === 'Connected to MongoDB') {
                const [
                    recordingCounts,
                    averageAudioDuration,
                    averageScore,
                    averageProcessingTime,
                    agentScores
                ] = await Promise.all([
                    fetchRecordingCounts(companyData.database, agent.username),
                    fetchAverageAudioDuration(companyData.database, agent.username),
                    fetchAverageScore(companyData.database, agent.username),
                    fetchAverageProcessingTime(companyData.database, agent.username),
                    fetchAgentScores(companyData.database, agent.username)
                ]);

                setRecordingCount(recordingCounts.currentMonthCount);
                calculatePercentageChange(recordingCounts.currentMonthCount, recordingCounts.lastMonthCount);

                setAverageAudioDuration(averageAudioDuration.averageDurationText);
                calculateAudioDurationChange(averageAudioDuration.averageDurationInSecondsCurrentMonth, averageAudioDuration.averageDurationInSecondsLastMonth);

                setAverageScore(averageScore.averageScoreCurrentMonth);
                calculateAverageScoreChange(averageScore.averageScoreCurrentMonth, averageScore.averageScoreLastMonth);

                setAverageProcessingTime(averageProcessingTime.averageProcessingTimeText);
                calculateProcessingTimeChange(averageProcessingTime.averageProcessingTimeInSecondsCurrentMonth, averageProcessingTime.averageProcessingTimeInSecondsLastMonth);

                setScoreData(agentScores);
                calculateScoreTrend(agentScores);

                await fetchSummary();
                
                setIsDataLoaded(true);
            }
        } catch (error) {
            handleConnectionError(error);
        } finally {
            setLoading(false);
        }
    }, [companyData?.database, agent, calculatePercentageChange, calculateAudioDurationChange, calculateAverageScoreChange, calculateProcessingTimeChange, calculateScoreTrend, handleConnectionError, fetchSummary]);

    const fetchCallsData = useCallback(async (page: number) => {
        if (!companyData?.database || !agent) return;

        setCallsLoading(true);
        try {
            const data = await fetchCalls(companyData.database, page, limitPerPage, agent.username);
            setCalls(Array.isArray(data.calls) ? data.calls : []);
            setTotalCalls(data.totalCalls || 0);
        } catch (error) {
            console.error('Error fetching calls:', error);
            setCalls([]);
        } finally {
            setCallsLoading(false);
        }
    }, [companyData?.database, agent, limitPerPage]);

    useEffect(() => {
        if (agent) {
            setLoading(true);
            refetchData();
            fetchCallsData(page);
        }
    }, [agent, refetchData, fetchCallsData, page]);

    useEffect(() => {
        if (isDataLoaded && agent) {
            const agentChatProps = {
                agentName: `${agent.first_name} ${agent.last_name}`,
                projectName: agent.project,
                username: agent.username,
                totalCalls: recordingCount || 0,
                averageScore: averageScore || 0,
                averageCallDuration: averageAudioDuration || '',
                averageProcessingTime: averageProcessingTime || '',
                percentageChange: percentageChange || '',
                audioDurationChange: audioDurationChange || '',
                averageScoreChange: averageScoreChange || '',
                processingTimeChange: processingTimeChange || '',
                scoreTrend: scoreTrend,
                connectionStatus: connectionStatus,
                agentSummary: agentSummary,
                totalCallsThisMonth: recordingCount || 0
            };
            window.dispatchEvent(new CustomEvent('agentChatPropsChange', { detail: agentChatProps }));
        }
    }, [
        isDataLoaded,
        agent,
        recordingCount,
        averageScore,
        averageAudioDuration,
        averageProcessingTime,
        percentageChange,
        audioDurationChange,
        averageScoreChange,
        processingTimeChange,
        scoreTrend,
        connectionStatus,
        agentSummary
    ]);

    useEffect(() => {
        if (agent && companyData?.database) {
            fetchAgentMetrics(companyData.database, agent.username).then(setMetrics);
        }
    }, [agent, companyData]);


    const handleDelete = useCallback(async (id: string) => {
        if (!companyData?.database) return;

        try {
            await deleteCall(companyData.database, id);
            fetchCallsData(page);
        } catch (error) {
            console.error('Error deleting call:', error);
        }
    }, [companyData?.database, fetchCallsData, page]);

    const handleViewCallDetails = useCallback((call: CallDetails) => {
        setSelectedCall(call);
        setCallDetailsDrawerOpen(true);
    }, []);

    const handleViewAgentDetails = useCallback((agentDetails: any) => {
        console.log('View agent details:', agentDetails);
    }, []);

    const formatDuration = useCallback((seconds: number): string => {
        const roundedSeconds = Math.round(seconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const remainingSeconds = roundedSeconds % 60;
        return `${minutes}m ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}s`;
    }, []);

    const renderStatus = useCallback((status: string): React.ReactNode => {
        let statusClass = '';
        let statusText = '';

        switch (status) {
            case 'processed':
                statusClass = 'bg-green-100 text-green-700';
                statusText = t.conversationsTab.statusLabels.done;
                break;
            case 'processing':
                statusClass = 'bg-yellow-100 text-yellow-700';
                statusText = t.conversationsTab.statusLabels.processing;
                break;
            case 'new':
                statusClass = 'bg-blue-100 text-blue-700';
                statusText = t.conversationsTab.statusLabels.new;
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-700';
                statusText = status;
                break;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
                {statusText}
            </span>
        );
    }, [t.conversationsTab.statusLabels]);

    const cardsData = useMemo(() => {
        if (!agent) return [];

        return [
            {
                icon: <Phone className="h-4 w-4 text-muted-foreground" />,
                title: t.dashboard.totalCalls,
                value: recordingCount,
                change: percentageChange,
                loading
            },
            {
                icon: <Clock className="h-4 w-4 text-muted-foreground" />,
                title: t.dashboard.averageTime,
                value: averageAudioDuration,
                change: audioDurationChange,
                loading
            },
            {
                icon: <Award className="h-4 w-4 text-muted-foreground" />,
                title: t.dashboard.score,
                value: averageScore !== null ? `${averageScore} %` : null,
                change: averageScoreChange,
                loading
            },
            {
                icon: <Timer className="h-4 w-4 text-muted-foreground" />,
                title: t.dashboard.processingTime,
                value: averageProcessingTime,
                change: processingTimeChange,
                loading
            },
        ];
    }, [t.dashboard.totalCalls, t.dashboard.averageTime, t.dashboard.score, t.dashboard.processingTime, recordingCount, percentageChange, loading, averageAudioDuration, audioDurationChange, averageScore, averageScoreChange, averageProcessingTime, processingTimeChange, agent]);

    if (!agent) return null;

    const { first_name, last_name, project } = agent;

    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>{first_name[0]}{last_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold">
                        {first_name} {last_name}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {project}
                    </p>
                </div>
            </div>
            <Tabs defaultValue="agent_overview" className="w-full mt-4">
                <TabsList>
                    <TabsTrigger value="agent_overview">{t.agent_page.projectOverview}</TabsTrigger>
                    <TabsTrigger value="agent_activity">{t.agent_page.agentActivity}</TabsTrigger>
                    <TabsTrigger value="analytics">{t.agent_page.analytics}</TabsTrigger>
                </TabsList>
                <TabsContent value="agent_overview">
                    <ProjectOverviewTab
                        agentDetails={agent}
                        loading={loading}
                        cardsData={cardsData}
                        scoreData={scoreData}
                        scoreTrend={scoreTrend}
                        t={t}
                        language={language}
                        companyData={companyData?.database}
                        recordingCount={recordingCount || 0}
                        percentageChange={percentageChange || ''}
                        averageAudioDuration={averageAudioDuration || ''}
                        averageScore={averageScore || 0}
                        averageProcessingTime={averageProcessingTime || ''}
                    />
                </TabsContent>
                <TabsContent value="agent_activity">
                    <AgentActivityTab
                        agentDetails={agent}
                        calls={calls}
                        callsLoading={callsLoading}
                        handleViewCallDetails={handleViewCallDetails}
                        handleDelete={handleDelete}
                        handleViewAgentDetails={handleViewAgentDetails}
                        formatDuration={formatDuration}
                        renderStatus={renderStatus}
                        t={t}
                        theme={theme || 'light'}
                        companyData={companyData?.database || ''}
                    />
                </TabsContent>
                <TabsContent value="analytics">
                    <AnalyticsTab metrics={metrics} t={t} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AgentDetailsClient;
