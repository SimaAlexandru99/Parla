import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { Laugh, Smile, Meh, Frown, Angry } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { assets } from '@/constants/assets';
import { CallDetails } from '@/types/PropsTypes';
import { Segment } from '@/types/PropsTypes';
import { Skeleton } from '@/components/ui/skeleton';
import ChatCallPopover from '@/components/layout/Chat';
import { DialogProvider } from '@/contexts/DialogContext';
import ReactPlayer from 'react-player';
import ReactMarkdown from 'react-markdown';
import TalkRatioChart from '@/components/charts/TalkRatioChart';
import WordFrequencyChart from '@/components/charts/WordFrequencyChart';
import { useLanguage } from "@/contexts/LanguageContext";
import CallSummaryCard from './Cards/CallSummaryCard';
import CallDetailsCard from './Cards/CallDetailsCard';
import ImprovedDrawerFooter from './Footer/ImprovedDrawerFooter';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
};

const getSentimentEmoji = (score: number) => {
    const emojis: { [key: number]: JSX.Element } = {
        5: <Laugh className="h-5 w-5 text-green-500" />,
        4: <Smile className="h-5 w-5 text-green-400" />,
        3: <Meh className="h-5 w-5 text-yellow-400" />,
        2: <Frown className="h-5 w-5 text-orange-400" />,
        1: <Angry className="h-5 w-5 text-red-600" />,
    };
    return emojis[score] || null;
};

const useLoading = (isOpen: boolean) => {
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setVisible(false);
            const timer = setTimeout(() => {
                setLoading(false);
                setVisible(true);
            }, 3000); // Show loading for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return { loading, visible };
};

interface CallDetailsDrawerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    callDetails: CallDetails;
}

interface WordCount {
    word: string;
    count: number;
}

const findMostFrequentWords = (segments: Segment[]): WordCount[] => {
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

function CallDetailsDrawer({ isOpen, onOpenChange, callDetails }: CallDetailsDrawerProps) {
    const { theme } = useTheme();
    const { loading, visible } = useLoading(isOpen);
    const playerRef = useRef<ReactPlayer>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [frequentWords, setFrequentWords] = useState<WordCount[]>([]);
    const { t } = useLanguage();

    const {
        phone_number,
        agent_info: { first_name, last_name, project },
        day_processed,
        file_info: { duration, file_path },
        total_talk_duration,
        crosstalk_duration,
        total_dead_air_duration,
        segments,
        call_summary,
    } = callDetails;

    const agentBgColor = 'bg-[hsl(var(--primary))]';
    const clientBgColor = 'bg-[hsl(var(--muted))]';
    const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
    const highlightedBgColor = theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-300';

    const formattedTotalDeadAir = useMemo(() => formatTime(total_dead_air_duration.SPEAKER_00 + total_dead_air_duration.SPEAKER_01), [total_dead_air_duration]);

    const { agentSegmentsText, clientSegmentsText, averageSentimentScore } = useMemo(() => processSegments(segments), [segments]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

        useEffect(() => {
            if (scrollAreaRef.current) {
                const activeSegment = document.querySelector('.active-segment');
                if (activeSegment) {
                    activeSegment.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, [currentTime]);

    useEffect(() => {
        if (callDetails?.segments) {
            const words = findMostFrequentWords(callDetails.segments);
            setFrequentWords(words.slice(0, 10)); // Get top 10 frequent words
        }
    }, [callDetails]);

    const handleSegmentClick = (startTime: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(startTime, 'seconds');
        }
    };

    const totalDuration = duration;
    const repDuration = total_talk_duration.SPEAKER_00;
    const customerDuration = total_talk_duration.SPEAKER_01;
    const deadAirDuration = total_dead_air_duration.SPEAKER_00 + total_dead_air_duration.SPEAKER_01;
    const crosstalkDuration = crosstalk_duration;

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="w-full h-full max-w-none max-h-none flex flex-col">
                <DrawerHeader>
                    <DrawerTitle className={`text-4xl font-bold text-transparent bg-clip-text ${theme === 'dark' ? 'bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]' : 'bg-gradient-to-r from-[#5684D1] to-[#1BA1E3]'}`}>
                        {t.call_page.callDetails}: {phone_number}
                    </DrawerTitle>
                    <DrawerDescription>
                        {t.call_page.agent}: {first_name} {last_name}<br />
                        {t.call_page.project}: {project}
                    </DrawerDescription>
                </DrawerHeader>
                <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
                    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
                        <Card className="xl:col-span-2 order-first md:order-first xl:order-last">
                            <CardContent>
                                <div className="w-full mt-4">
                                    <Tabs defaultValue="overview" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="overview">{t.call_page.overview}</TabsTrigger>
                                            <TabsTrigger value="analytics">{t.call_page.analytics}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="overview">
                                            <div className="flex flex-col gap-4">
                                                <CallSummaryCard
                                                    loading={loading}
                                                    visible={visible}
                                                    call_summary={call_summary}
                                                    t={t}
                                                />
                                                <CallDetailsCard
                                                    callDetails={{
                                                        first_name,
                                                        last_name,
                                                        project,
                                                        day_processed,
                                                        phone_number,
                                                        duration,
                                                        total_talk_duration,
                                                        crosstalk_duration,
                                                        total_dead_air_duration,
                                                    }}
                                                    t={t}
                                                    formatTime={formatTime}
                                                />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="analytics">
                                            <ScrollArea >
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
                                            </ScrollArea>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="xl:col-span-2">
                            <CardHeader>
                                <CardTitle>{t.call_page.conversation}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[50rem]">
                                    <div className="grid gap-4">
                                        {segments.map((segment: Segment, index: number) => (
                                            <div key={index} className={`flex ${currentTime >= segment.time_range.start && currentTime <= segment.time_range.end ? 'active-segment' : ''}`} onClick={() => handleSegmentClick(segment.time_range.start)}>
                                                {segment.type_speaker === 'agent' ? (
                                                    <>
                                                        <Card className={`flex-1 ${currentTime >= segment.time_range.start && currentTime <= segment.time_range.end ? highlightedBgColor : agentBgColor} p-2 rounded-md mr-2 cursor-pointer`}>
                                                            <p>
                                                                <strong>{first_name} {last_name}:</strong> {segment.transcription}
                                                                <p className={`text-sm ${textColor}`}>{formatTime(segment.time_range.start)}</p>
                                                            </p>
                                                            <div className="flex items-center">{getSentimentEmoji(segment.sentiment_score)}</div>
                                                        </Card>
                                                        <div className="flex-1"></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex-1"></div>
                                                        <Card className={`flex-1 ${currentTime >= segment.time_range.start && currentTime <= segment.time_range.end ? highlightedBgColor : clientBgColor} p-2 rounded-md ml-2 cursor-pointer`}>
                                                            <p>
                                                                <strong>{t.call_page.client}:</strong> {segment.transcription}
                                                                <p className={`text-sm ${textColor}`}>{formatTime(segment.time_range.start)}</p>
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
                </ScrollArea>
                <ImprovedDrawerFooter file_path={file_path} playerRef={playerRef} t={t} />
                <div className="fixed bottom-4 right-4 z-50">
                    <DialogProvider>
                        <ChatCallPopover
                            segments={segments}
                            agentSegmentsText={agentSegmentsText}
                            clientSegmentsText={clientSegmentsText}
                            averageSentimentScore={averageSentimentScore}
                            mostFrequentWords={frequentWords}
                            agent_info={{ first_name, last_name, project }}
                        />
                    </DialogProvider>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default CallDetailsDrawer;
