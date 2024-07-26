'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchAgentDetails, fetchAgentMetrics, fetchRecordingCounts, fetchAverageAudioDuration, fetchAverageScore, fetchAverageProcessingTime, fetchAgentScores } from '@/lib/apiClient';
import { AgentDetails } from '@/types/PropsTypes';
import { FetchUserCompanyDatabaseResult } from '@/types/CompanyTypes';
import AgentDetailsClient from '@/components/client/agent/AgentDetailsClient';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatAgentPopoverProps } from '@/types/PropsTypes';  // Adjust the import path as necessary



export default function AgentDetailsWrapper() {
    const params = useParams();
    const id = params?.id as string;
    const { companyData, loading: companyLoading, error: companyError }: FetchUserCompanyDatabaseResult = useFetchUserCompanyDatabase();
    const [agent, setAgent] = useState<AgentDetails | null>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAgentDetails() {
            if (id && companyData?.database) {
                try {
                    const agentData = await fetchAgentDetails(companyData.database, id);
                    setAgent(agentData);

                    const metricsData = await fetchAgentMetrics(companyData.database, agentData.username);
                    const recordingCounts = await fetchRecordingCounts(companyData.database, agentData.username);
                    const averageAudioDuration = await fetchAverageAudioDuration(companyData.database, agentData.username);
                    const averageScore = await fetchAverageScore(companyData.database, agentData.username);
                    const averageProcessingTime = await fetchAverageProcessingTime(companyData.database, agentData.username);
                    const agentScores = await fetchAgentScores(companyData.database, agentData.username);

                    const newMetrics = {
                        ...metricsData,
                        recordingCounts,
                        averageAudioDuration,
                        averageScore,
                        averageProcessingTime,
                        agentScores
                    };
                    setMetrics(newMetrics);

                    const agentChatProps: ChatAgentPopoverProps = {
                        agentName: `${agentData.first_name} ${agentData.last_name}`,
                        projectName: agentData.project,
                        username: agentData.username,
                        totalCalls: recordingCounts.currentMonthCount,
                        averageScore: averageScore.averageScoreCurrentMonth,
                        averageCallDuration: averageAudioDuration.averageDurationText,
                        averageProcessingTime: averageProcessingTime.averageProcessingTimeText,
                        percentageChange: calculatePercentageChange(recordingCounts),
                        audioDurationChange: calculateAudioDurationChange(averageAudioDuration),
                        averageScoreChange: calculateAverageScoreChange(averageScore),
                        processingTimeChange: calculateProcessingTimeChange(averageProcessingTime),
                        scoreTrend: calculateScoreTrend(agentScores),
                        connectionStatus: 'Connected', // You may want to replace this with actual connection status
                        agentSummary: '', // You may want to fetch this separately if available
                        totalCallsThisMonth: recordingCounts.currentMonthCount,
                      };
                      
                      window.dispatchEvent(new CustomEvent('agentChatPropsChange', { detail: agentChatProps }));

                } catch (err) {
                    console.error('Failed to fetch agent details:', err);
                    setError('Failed to load agent details. Please try again later.');
                }
            }
        }

        if (!companyLoading && !companyError) {
            loadAgentDetails();
        }
    }, [id, companyData?.database, companyLoading, companyError]);

    // Clean up the event when the component unmounts
    useEffect(() => {
        return () => {
            window.dispatchEvent(new CustomEvent('agentChatPropsChange', { detail: null }));
        };
    }, []);

    if (companyLoading) {
        return <div>Loading company data...</div>;
    }

    if (companyError) {
        return <div>Error loading company data: {companyError}</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!agent || !metrics) {
        return (
            <div className="flex justify-center w-full">
                <div className='flex flex-1 flex-col h-screen gap-4 p-4 md:gap-8 md:p-6 w-full md:w-4/5 lg:w-3/5'>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    return <AgentDetailsClient initialAgent={agent} initialMetrics={metrics} />;
}


function calculatePercentageChange(recordingCounts: any) {
    if (recordingCounts.lastMonthCount > 0) {
        const change = ((recordingCounts.currentMonthCount - recordingCounts.lastMonthCount) / recordingCounts.lastMonthCount) * 100;
        return `${change.toFixed(2)}% ${change >= 0 ? 'more' : 'fewer'} processed`;
    } else {
        return 'No data for last month';
    }
}

function calculateScoreTrend(scores: { score: number }[]): { percentage: number; trending: 'up' | 'down' | 'neutral' } {
    if (scores.length < 2) return { percentage: 0, trending: 'neutral' };
    const lastScore = scores[scores.length - 1].score;
    const previousScore = scores[scores.length - 2].score;
    const change = ((lastScore - previousScore) / previousScore) * 100;
    return {
        percentage: Math.abs(change),
        trending: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
}

function calculateAudioDurationChange(averageAudioDuration: any) {
    if (averageAudioDuration.averageDurationInSecondsLastMonth > 0) {
        const change = ((averageAudioDuration.averageDurationInSecondsCurrentMonth - averageAudioDuration.averageDurationInSecondsLastMonth) / averageAudioDuration.averageDurationInSecondsLastMonth) * 100;
        return `${change.toFixed(2)}% ${change >= 0 ? 'longer' : 'shorter'}`;
    } else {
        return 'No data for last month';
    }
}

function calculateAverageScoreChange(averageScore: any) {
    if (averageScore.averageScoreLastMonth > 0) {
        const change = ((averageScore.averageScoreCurrentMonth - averageScore.averageScoreLastMonth) / averageScore.averageScoreLastMonth) * 100;
        return `${change.toFixed(2)}% ${change >= 0 ? 'higher' : 'lower'}`;
    } else {
        return 'No data for last month';
    }
}

function calculateProcessingTimeChange(averageProcessingTime: any) {
    if (averageProcessingTime.averageProcessingTimeInSecondsLastMonth > 0) {
        const change = ((averageProcessingTime.averageProcessingTimeInSecondsCurrentMonth - averageProcessingTime.averageProcessingTimeInSecondsLastMonth) / averageProcessingTime.averageProcessingTimeInSecondsLastMonth) * 100;
        return `${change.toFixed(2)}% ${change >= 0 ? 'longer' : 'shorter'}`;
    } else {
        return 'No data for last month';
    }
}