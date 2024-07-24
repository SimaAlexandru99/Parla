import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { assets } from '@/constants/assets';
import { fetchAgentSummary } from '@/lib/apiClient';

interface AgentSummaryCardProps {
    t: {
        agentDetailsDrawer: {
            agentSummary: string;
            agentSummaryDescription: string;
        };
    };
    language: string;
    agentDetails: {
        first_name: string;
        last_name: string;
        username: string;
    };
    companyDatabase?: string; // Made optional
    recordingCount: number;
    percentageChange: string;
    averageAudioDuration: string;
    averageScore: number;
    averageProcessingTime: string;
}

function AgentSummaryCard({
    t,
    language,
    agentDetails,
    companyDatabase,
    recordingCount,
    percentageChange,
    averageAudioDuration,
    averageScore,
    averageProcessingTime
}: AgentSummaryCardProps) {
    const [loading, setLoading] = useState(true);
    const [agentSummary, setAgentSummary] = useState('');

    const fetchSummary = useCallback(async () => {
        if (!agentDetails || !companyDatabase) return;

        try {
            setLoading(true);
            const summary = await fetchAgentSummary(
                companyDatabase,
                `${agentDetails.first_name} ${agentDetails.last_name}`,
                agentDetails.username,
                language,
                recordingCount,
                percentageChange,
                averageAudioDuration,
                averageScore,
                averageProcessingTime
            );

            setAgentSummary(summary.summary);
        } catch (error) {
            console.error('Error fetching agent summary:', error);
            setAgentSummary('Failed to generate agent summary.');
        } finally {
            setLoading(false);
        }
    }, [agentDetails, companyDatabase, language, recordingCount, percentageChange, averageAudioDuration, averageScore, averageProcessingTime]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>{t.agentDetailsDrawer.agentSummary}</CardTitle>
                <CardDescription>{t.agentDetailsDrawer.agentSummaryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-start">
                <div className="flex items-start mr-4 w-6 h-6">
                    {loading ? (
                        <div className="animate-spin-slow">
                            <Image
                                src={assets.gemini}
                                alt="Gemini"
                                width={25}
                                height={25}
                            />
                        </div>
                    ) : (
                        <Image
                            src={assets.gemini}
                            alt="Gemini"
                            width={25}
                            height={25}
                            className="transition-all ease-in duration-500 opacity-100 translate-y-0"
                        />
                    )}
                </div>
                <div className="flex-1">
                    {loading ? (
                        <>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                        </>
                    ) : (
                        <div className="transition-all ease-in duration-500 opacity-100 translate-y-0">
                            <ReactMarkdown>{agentSummary}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default AgentSummaryCard;