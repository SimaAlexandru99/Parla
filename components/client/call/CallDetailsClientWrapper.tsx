'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCallDetails } from '@/lib/apiClient';
import { CallDetails, Segment } from '@/types/PropsTypes';
import CallDetailsClient from './CallDetailsClient';
import { Skeleton } from '@/components/ui/skeleton';

const processSegments = (segments: Segment[]) => {
  const agentSegmentsText = segments
    .filter((segment: Segment) => segment.type_speaker === 'agent')
    .map((segment: Segment) => segment.transcription)
    .join(' ');

  const clientSegmentsText = segments
    .filter((segment: Segment) => segment.type_speaker === 'client')
    .map((segment: Segment) => segment.transcription)
    .join(' ');

  const sentimentScores = segments.map(segment => segment.sentiment_score);
  const averageSentimentScore = sentimentScores.length > 0
    ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
    : 0;

  return { agentSegmentsText, clientSegmentsText, averageSentimentScore };
};

const findMostFrequentWords = (segments: Segment[]): { word: string; count: number }[] => {
  const wordCounts: { [key: string]: number } = {};

  segments.forEach((segment: Segment) => {
    const words = segment.transcription
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/);

    words.forEach((word: string) => {
      if (word.length > 1) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

export default function CallDetailsWrapper() {
  const params = useParams();
  const id = params?.id as string;
  const { companyData } = useFetchUserCompanyDatabase();
  const [call, setCall] = useState<CallDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCallDetails = useCallback(async () => {
    if (id && companyData?.database) {
      setIsLoading(true);
      setError(null);
      try {
        const callData = await fetchCallDetails(companyData.database, id);
        setCall(callData);
      } catch (err) {
        console.error('Failed to fetch call details:', err);
        setError('Failed to load call details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, companyData?.database]);

  useEffect(() => {
    loadCallDetails();
  }, [loadCallDetails]);

  const chatProps = useMemo(() => {
    if (!call || !call.segments) return null;

    const { agentSegmentsText, clientSegmentsText, averageSentimentScore } = processSegments(call.segments);
    const mostFrequentWords = findMostFrequentWords(call.segments);

    return {
      agentName: `${call.agent_info.first_name} ${call.agent_info.last_name}`,
      projectName: call.agent_info.project,
      agentSegmentsText,
      clientSegmentsText,
      averageSentimentScore,
      mostFrequentWords,
      agent_info: call.agent_info
    };
  }, [call]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatPropsChange', { detail: chatProps }));
    return () => {
      window.dispatchEvent(new CustomEvent('chatPropsChange', { detail: null }));
    };
  }, [chatProps]);

  if (error) {
    return <div>{error}</div>;
  }

  if (isLoading) {
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

  if (!call) {
    return <div>No call data available.</div>;
  }

  return <CallDetailsClient initialCall={call} />;
}