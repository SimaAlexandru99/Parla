'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCallDetails } from '@/lib/apiClient';
import { CallDetails, Segment } from '@/types/PropsTypes';

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
  const averageSentimentScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

  return { agentSegmentsText, clientSegmentsText, averageSentimentScore };
};

export default function CallDetailsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params?.id as string;
  const { companyData } = useFetchUserCompanyDatabase();
  const [call, setCall] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const loadCallDetails = async () => {
      if (id && companyData?.database) {
        try {
          const callData = await fetchCallDetails(companyData.database, id);
          setCall(callData);
        } catch (error) {
          console.error('Failed to fetch call details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCallDetails();
  }, [id, companyData?.database]);

  const { agentSegmentsText, clientSegmentsText, averageSentimentScore } = useMemo(() => 
    processSegments(call?.segments || []), [call?.segments]
  );

  const handleSegmentClick = (startTime: number) => {
    setCurrentTime(startTime);
    // Here you would also need to implement logic to control audio playback
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSentimentEmoji = (score: number) => {
    if (score > 0.5) return '😊';
    if (score < -0.5) return '😟';
    return '😐';
  };

  if (loading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!call) {
    return <div>{t.common.noDataAvailable}</div>;
  }

  const { first_name, last_name } = call.agent_info;
  const agentBgColor = 'bg-primary text-primary-foreground';
  const clientBgColor = 'bg-muted text-muted-foreground';
  const highlightedBgColor = 'bg-accent text-accent-foreground';

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>
      <div className="w-full">
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle>Test</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ... (previous call details content) ... */}
          </CardContent>
        </Card>
        
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t.call_page.conversation}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50rem]">
              <div className="grid gap-4">
                {call.segments.map((segment: Segment, index: number) => (
                  <div 
                    key={index} 
                    className={`flex ${currentTime >= segment.time_range.start && currentTime <= segment.time_range.end ? 'active-segment' : ''}`} 
                    onClick={() => handleSegmentClick(segment.time_range.start)}
                  >
                    {segment.type_speaker === 'agent' ? (
                      <>
                        <Card className={`flex-1 ${currentTime >= segment.time_range.start && currentTime <= segment.time_range.end ? highlightedBgColor : agentBgColor} p-2 rounded-md mr-2 cursor-pointer transition-colors duration-200`}>
                          <p>
                            <strong>{first_name} {last_name}:</strong> {segment.transcription}
                            <p className="text-sm opacity-70">{formatTime(segment.time_range.start)}</p>
                          </p>
                          <div className="flex items-center">{getSentimentEmoji(segment.sentiment_score)}</div>
                        </Card>
                        <div className="flex-1"></div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1"></div>
                        <Card className={`flex-1 ${currentTime >= segment.time_range.start && currentTime <= segment.time_range.end ? highlightedBgColor : clientBgColor} p-2 rounded-md ml-2 cursor-pointer transition-colors duration-200`}>
                          <p>
                            <strong>{t.call_page.client}:</strong> {segment.transcription}
                            <p className="text-sm opacity-70">{formatTime(segment.time_range.start)}</p>
                          </p>
                          <div className="flex items-center">{getSentimentEmoji(segment.sentiment_score)}</div>
                        </Card>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}