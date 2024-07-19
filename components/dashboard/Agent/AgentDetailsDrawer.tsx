// components/dashboard/Agent/AgentDetailsDrawer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { AgentDetails, CallDetails } from '@/types/PropsTypes';
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Phone, Clock, Award, Timer } from 'lucide-react';
import { fetchAgentMetrics, checkMongoConnection, fetchRecordingCounts, fetchAverageAudioDuration, fetchAverageScore, fetchAverageProcessingTime, fetchAgentScores, fetchAgentSummary, fetchCalls, deleteCall } from '@/lib/apiClient';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { AgentMetrics } from '@/types/AgentMetrics';
import CallDetailsDrawer from '@/components/dashboard/Call/CallDetailsDrawer';
import ProjectOverviewTab from '@/components/dashboard/Agent/Tabs/AgentOverviewTab';
import AgentActivityTab from '@/components/dashboard/Agent/Tabs/AgentActivityTab';
import AnalyticsTab from '@/components/dashboard/Agent/Tabs/AnalyticsTab';


interface AgentDetailsDrawerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    agentDetails: AgentDetails | null;
}

const AgentDetailsDrawer = ({ isOpen, onOpenChange, agentDetails }: AgentDetailsDrawerProps) => {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
    const [connectionStatus, setConnectionStatus] = useState('Checking connection...');
    const [loading, setLoading] = useState(true);
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
    const [callDetailsDrawerOpen, setCallDetailsDrawerOpen] = useState(false);
    const [selectedCall, setSelectedCall] = useState<CallDetails | null>(null);
    const [calls, setCalls] = useState<CallDetails[]>([]);
    const [callsLoading, setCallsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCalls, setTotalCalls] = useState(0);
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
        if (!agentDetails || !companyData?.database) return;

        try {
            const summary = await fetchAgentSummary(
                companyData.database,
                `${agentDetails.first_name} ${agentDetails.last_name}`,
                agentDetails.username,
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
    }, [agentDetails, companyData?.database, language, recordingCount, percentageChange, averageAudioDuration, averageScore, averageProcessingTime]);

    const refetchData = useCallback(async () => {
        if (!companyData?.database || !agentDetails) return;

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
                    fetchRecordingCounts(companyData.database, agentDetails.username),
                    fetchAverageAudioDuration(companyData.database, agentDetails.username),
                    fetchAverageScore(companyData.database, agentDetails.username),
                    fetchAverageProcessingTime(companyData.database, agentDetails.username),
                    fetchAgentScores(companyData.database, agentDetails.username)
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
            }
        } catch (error) {
            handleConnectionError(error);
        } finally {
            setLoading(false);
        }
    }, [companyData?.database, agentDetails, calculatePercentageChange, calculateAudioDurationChange, calculateAverageScoreChange, calculateProcessingTimeChange, calculateScoreTrend, handleConnectionError, fetchSummary]);

    const fetchCallsData = useCallback(async (page: number) => {
        if (!companyData?.database || !agentDetails) return;

        setCallsLoading(true);
        try {
            const data = await fetchCalls(companyData.database, page, limitPerPage, agentDetails.username);
            setCalls(Array.isArray(data.calls) ? data.calls : []);
            setTotalCalls(data.totalCalls || 0);
        } catch (error) {
            console.error('Error fetching calls:', error);
            setCalls([]);
        } finally {
            setCallsLoading(false);
        }
    }, [companyData?.database, agentDetails, limitPerPage]);

    useEffect(() => {
        if (isOpen && agentDetails) {
            setLoading(true);
            refetchData();
            fetchCallsData(page);
        }
    }, [isOpen, agentDetails, refetchData, fetchCallsData, page]);

    useEffect(() => {
        if (agentDetails && companyData?.database) {
            fetchAgentMetrics(companyData.database, agentDetails.username).then(setMetrics);
        }
    }, [agentDetails, companyData]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

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
        if (!agentDetails) return [];

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
    }, [t.dashboard.totalCalls, t.dashboard.averageTime, t.dashboard.score, t.dashboard.processingTime, recordingCount, percentageChange, loading, averageAudioDuration, audioDurationChange, averageScore, averageScoreChange, averageProcessingTime, processingTimeChange, agentDetails]);

    if (!agentDetails) return null;

    const { first_name, last_name, project } = agentDetails;

    return (
        <>
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent className="w-full h-full max-w-none max-h-none flex  flex-col">
                    <DrawerHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{first_name[0]}{last_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <DrawerTitle className="text-lg font-semibold">
                                    {first_name} {last_name}
                                </DrawerTitle>
                                <DrawerDescription className="text-sm text-gray-500">
                                    {project}
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>
                    <ScrollArea className="flex-grow p-4">
                        <Tabs defaultValue="agent_overview" className="w-full">
                            <TabsList>
                                <TabsTrigger value="agent_overview">{t.agent_page.projectOverview}</TabsTrigger>
                                <TabsTrigger value="agent_activity">{t.agent_page.agentActivity}</TabsTrigger>
                                <TabsTrigger value="analytics">{t.agent_page.analytics}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="agent_overview">
                                <ProjectOverviewTab
                                    agentDetails={agentDetails}
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
                                    agentDetails={agentDetails}
                                    calls={calls}
                                    callsLoading={callsLoading}
                                    handleViewCallDetails={handleViewCallDetails}
                                    handleDelete={handleDelete}
                                    handleViewAgentDetails={handleViewAgentDetails}
                                    formatDuration={formatDuration}
                                    renderStatus={renderStatus}
                                    t={t}
                                    theme={theme || 'light'}  // Provide a fallback value for theme
                                    companyData={companyData?.database || ''}
                                />
                            </TabsContent>
                            <TabsContent value="analytics">
                                <AnalyticsTab metrics={metrics} t={t} />
                            </TabsContent>

                        </Tabs>
                    </ScrollArea>
                    <DrawerFooter>
                        <DrawerClose className="pt-8">
                            {t.agent_page.close}
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            {selectedCall && (
                <CallDetailsDrawer
                    isOpen={callDetailsDrawerOpen}
                    onOpenChange={setCallDetailsDrawerOpen}
                    callDetails={selectedCall}
                />
            )}
        </>
    );
};

export default AgentDetailsDrawer;
