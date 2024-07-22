import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from "@/components/ui/scroll-area";

interface CallSummaryCardProps {
    loading: boolean;
    visible: boolean;
    call_summary: string;
    call: {
        segments: {
            type_speaker: string;
        }[];
        file_info: {
            duration: number;
        };
    };
    averageSentimentScore: number;
    formatTime: (seconds: number) => string;
    t: {
        call_page: {
            callSummary: string;
        };
    };
    assets: {
        gemini: string;
    };
}

export default function CallSummaryCard({
    loading,
    visible,
    call_summary,
    call,
    averageSentimentScore,
    formatTime,
    t,
    assets
}: CallSummaryCardProps) {
    return (
        <Card className=" text-secondary-foreground w-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center">
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
                                className={`${visible ? 'transition-all ease-in duration-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                            />
                        )}
                    </div>
                    {t.call_page.callSummary}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    {loading ? (
                        <Skeleton className="h-24 w-full" />
                    ) : (
                        <div className={`${visible ? 'transition-all ease-in duration-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <ReactMarkdown className="prose dark:prose-invert">{call_summary}</ReactMarkdown>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
