'use client'
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCallDetails } from '@/lib/apiClient';
import { CallDetails, Segment } from '@/types/PropsTypes';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactPlayer from 'react-player';
import AudioPlayer from '@/components/common/audio-player';

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
  const playerRef = useRef<ReactPlayer>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

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

  const updateActiveSegment = useCallback((time: number) => {
    const newActiveIndex = call?.segments.findIndex(
      (segment) => time >= segment.time_range.start && time <= segment.time_range.end
    ) ?? null;
    setActiveSegmentIndex(newActiveIndex);
    setCurrentTime(time);
  }, [call?.segments]);

  useEffect(() => {
    if (activeSegmentIndex !== null && scrollAreaRef.current) {
      const activeSegment = document.getElementById(`segment-${activeSegmentIndex}`);
      if (activeSegment) {
        activeSegment.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSegmentIndex]);

  const { agentSegmentsText, clientSegmentsText, averageSentimentScore } = useMemo(() =>
    processSegments(call?.segments || []), [call?.segments]
  );

  const handleSegmentClick = useCallback((startTime: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
      updateActiveSegment(startTime);
    }
  }, [updateActiveSegment]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSentimentEmoji = (score: number): string => {
    const emojis: { [key: number]: string } = {
      5: '😄',
      4: '🙂',
      3: '😐',
      2: '😕',
      1: '😢',
    };
    return emojis[Math.round(score)] || '❓';
  };

  if (loading) {
    return (
      <div className="flex justify-center w-full">
        <div className='flex flex-1 flex-col h-screen gap-4 p-4 md:gap-8 md:p-6 w-[70%]'>
          <Skeleton className="h-[50px]" />
          <div className="flex w-full h-[calc(100vh-200px)] gap-4">
            <div className="w-4/5 xl:col-span-2 flex flex-col overflow-hidden">
              <Skeleton className="h-[50px] w-full" />
              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className="h-[100px] w-full" />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <div className="w-1/4 flex flex-col gap-4">
              <Skeleton className="flex-1 h-[150px]" />
              <Skeleton className="flex-1 h-[150px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!call) {
    return <div>{t.common.noDataAvailable}</div>;
  }

  const { first_name, last_name } = call.agent_info;
  const agentBgColor = 'bg-primary text-primary-foreground';
  const clientBgColor = 'bg-muted text-muted-foreground';
  const focusBgColor = 'bg-accent text-accent-foreground';

  return (
    <div className="flex justify-center w-full">
      <div className='flex flex-1 flex-col h-screen gap-4 p-4 md:gap-8 md:p-6 w-[70%]'>
        <Tabs defaultValue="conversation" className="w-full">
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="conversation">
            <div className="flex w-full h-[calc(100vh-200px)] gap-4">
              <Card className="w-4/5 xl:col-span-2 flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle>{t.call_page.conversation}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-4 pr-4">
                      {call.segments.map((segment: Segment, index: number) => (
                        <div
                          key={index}
                          id={`segment-${index}`}
                          className={`flex ${index === activeSegmentIndex ? 'ring-2 ring-accent' : ''}`}
                          onClick={() => handleSegmentClick(segment.time_range.start)}
                        >
                          {segment.type_speaker === 'agent' ? (
                            <>
                              <div className={`flex-1 ${index === activeSegmentIndex ? focusBgColor : agentBgColor} p-2 rounded-md mr-2 cursor-pointer transition-colors duration-200`}>
                                <p>
                                  <strong>{first_name} {last_name}:</strong> {segment.transcription}
                                  <p className="text-sm opacity-70">{formatTime(segment.time_range.start)}</p>
                                </p>
                                <div className="flex items-center">{getSentimentEmoji(segment.sentiment_score)}</div>
                              </div>
                              <div className="flex-1"></div>
                            </>
                          ) : (
                            <>
                              <div className="flex-1"></div>
                              <div className={`flex-1 ${index === activeSegmentIndex ? focusBgColor : clientBgColor} p-2 rounded-md ml-2 cursor-pointer transition-colors duration-200`}>
                                <p>
                                  <strong>{t.call_page.client}:</strong> {segment.transcription}
                                  <p className="text-sm opacity-70">{formatTime(segment.time_range.start)}</p>
                                </p>
                                <div className="flex items-center">{getSentimentEmoji(segment.sentiment_score)}</div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <div className="w-1/4 flex flex-col gap-4">
                <Card className="flex-1 bg-primary text-primary-foreground">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary-foreground text-primary">
                          {`${first_name[0]}${last_name[0]}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-primary-foreground">{`${first_name} ${last_name}`}</CardTitle>
                        <p className="text-sm text-primary-foreground/80">Agent</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-stretch p-0">
                    <AudioPlayer 
                      url={call.file_info.file_path} 
                      playerRef={playerRef} 
                      onTimeUpdate={updateActiveSegment}
                    />
                  </CardFooter>
                </Card>
                <Card className="flex-1 bg-secondary text-secondary-foreground">
                  <CardHeader>
                    <CardTitle className="text-lg">Call Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Total Segments: {call.segments.length}</p>
                    <p>Client Segments: {call.segments.filter(s => s.type_speaker === 'client').length}</p>
                    <p>Agent Segments: {call.segments.filter(s => s.type_speaker === 'agent').length}</p>
                    <p>Average Sentiment: {averageSentimentScore.toFixed(2)}</p>
                    <p>Call Duration: {formatTime(call.file_info.duration)}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Call Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Agent Speaking Time: {formatTime(call.total_talk_duration.SPEAKER_00)}</p>
                <p>Client Speaking Time: {formatTime(call.total_talk_duration.SPEAKER_01)}</p>
                <p>Agent Dead Air Time: {formatTime(call.total_dead_air_duration.SPEAKER_00)}</p>
                <p>Client Dead Air Time: {formatTime(call.total_dead_air_duration.SPEAKER_01)}</p>
                <p>Crosstalk Duration: {formatTime(call.crosstalk_duration)}</p>
                <p>Call Score: {call.score.toFixed(2)}</p>
                <h3 className="text-lg font-semibold mt-4">Key Phrases:</h3>
                <ul>
                  {call.segments.flatMap(segment => segment.key_phrases).slice(0, 10).map((phrase, index) => (
                    <li key={index}>{phrase}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold mt-4">Entities:</h3>
                <ul>
                  {Array.from(new Set(call.segments.flatMap(segment => segment.entities))).slice(0, 10).map((entity, index) => (
                    <li key={index}>{entity}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
