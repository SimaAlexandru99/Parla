'use client'
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from "@/contexts/LanguageContext";
import { CallDetails, Segment } from '@/types/PropsTypes';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactPlayer from 'react-player';
import AudioPlayer from '@/components/AudioPlayer';
import CallSummaryCard from '@/components/calls/call/call-summary-card';
import { assets } from '@/constants/assets';
import TalkRatioChart from '@/components/talk-ratio-chart';
import WordFrequencyChart from '@/components/word-frequency-chart';
import CallDurationDistribution from '@/components/calls/call/call-duration-distribution';

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

const extractFrequentWords = (segments: Segment[]) => {
  const allWords = segments.flatMap(segment => segment.transcription.split(/\s+/));
  const wordCounts = allWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

const findMostFrequentWords = (segments: Segment[]): { word: string; count: number }[] => {
  const wordCounts: { [key: string]: number } = {};

  segments.forEach((segment: Segment) => {
    const words = segment.transcription
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .split(/\s+/); // Split by whitespace

    words.forEach((word: string) => {
      if (word.length > 1) { // Filter out empty strings and single-character words
        if (wordCounts[word]) {
          wordCounts[word]++;
        } else {
          wordCounts[word] = 1;
        }
      }
    });
  });

  const sortedWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a) // Sort by frequency descending
    .map(([word, count]) => ({ word, count })); // Include counts in result

  return sortedWords;
};

export default function CallDetailsClient({ initialCall }: { initialCall: CallDetails }) {
  const { t } = useLanguage();
  const [call] = useState<CallDetails>(initialCall);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [callSummaryLoading, setCallSummaryLoading] = useState(true);
  const [callSummaryVisible, setCallSummaryVisible] = useState(false);

  const { agentSegmentsText, clientSegmentsText, averageSentimentScore } = useMemo(() =>
    processSegments(call.segments), [call.segments]
  );

  const repDuration = call.total_talk_duration.SPEAKER_00;
  const customerDuration = call.total_talk_duration.SPEAKER_01;
  const deadAirDuration = call.total_dead_air_duration.SPEAKER_00 + call.total_dead_air_duration.SPEAKER_01;
  const crosstalkDuration = call.crosstalk_duration;
  const totalDuration = repDuration + customerDuration + deadAirDuration + crosstalkDuration;
  const frequentWords = useMemo(() => findMostFrequentWords(call.segments), [call.segments]);

  useEffect(() => {
    const mostFrequentWords = extractFrequentWords(call.segments);

    const chatProps = {
      agentName: `${call.agent_info.first_name} ${call.agent_info.last_name}`,
      projectName: call.agent_info.project,
      agentSegmentsText,
      clientSegmentsText,
      averageSentimentScore,
      mostFrequentWords,
      agent_info: call.agent_info
    };

    window.dispatchEvent(new CustomEvent('chatPropsChange', { detail: chatProps }));
  }, [call, agentSegmentsText, clientSegmentsText, averageSentimentScore]);

  useEffect(() => {
    setTimeout(() => {
      setCallSummaryLoading(false);
      setCallSummaryVisible(true);
    }, 2000);
  }, []);

  const updateActiveSegment = useCallback((time: number) => {
    const newActiveIndex = call.segments.findIndex(
      (segment) => time >= segment.time_range.start && time <= segment.time_range.end
    );
    setActiveSegmentIndex(newActiveIndex);
    setCurrentTime(time);
  }, [call.segments]);

  useEffect(() => {
    if (activeSegmentIndex !== null && scrollAreaRef.current) {
      const activeSegment = document.getElementById(`segment-${activeSegmentIndex}`);
      if (activeSegment) {
        activeSegment.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSegmentIndex]);

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
      5: '😄', 4: '🙂', 3: '😐', 2: '😕', 1: '😢',
    };
    return emojis[Math.round(score)] || '❓';
  };

  const { first_name, last_name } = call.agent_info;
  const agentBgColor = 'bg-primary text-primary-foreground';
  const clientBgColor = 'bg-muted text-muted-foreground';
  const focusBgColor = 'bg-accent text-accent-foreground';

  return (
    <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
      <div className='w-full'>
        <Tabs defaultValue="conversation" className="w-full">
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="conversation">
            <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-200px)] gap-4">
              <Card className="flex-1 flex flex-col overflow-hidden bg-background">
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
              <div className="w-full lg:w-1/4 flex flex-col gap-4">
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader className="p-4">
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
                  <CardFooter className="p-0">
                    <AudioPlayer
                      url={call.file_info.file_path}
                      playerRef={playerRef}
                      onTimeUpdate={updateActiveSegment}
                    />
                  </CardFooter>
                </Card>

              </div>
            </div>
          </TabsContent>
          <TabsContent value="analysis">
            <ScrollArea>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <TalkRatioChart
                    repDuration={repDuration}
                    customerDuration={customerDuration}
                    deadAirDuration={deadAirDuration}
                    crosstalkDuration={crosstalkDuration}
                    totalDuration={totalDuration}
                    title={t.call_page.talkRatio}
                  />
                  <WordFrequencyChart
                    wordFrequencyData={frequentWords.map(word => ({
                      name: word.word,
                      size: word.count,
                    }))}
                    title={t.call_page.wordFrequency}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <CallSummaryCard
                    loading={callSummaryLoading}
                    visible={callSummaryVisible}
                    call_summary={call.call_summary}
                    call={call}
                    averageSentimentScore={averageSentimentScore}
                    formatTime={formatTime}
                    t={t}
                    assets={assets}
                  />
                  <CallDurationDistribution
                    repDuration={repDuration}
                    customerDuration={customerDuration}
                    totalDuration={totalDuration}
                    title={t.call_page.callDurationDistribution}
                  />
                </div>

              </div>
            </ScrollArea>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}
