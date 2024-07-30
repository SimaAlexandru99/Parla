'use client'
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonIcon } from "@radix-ui/react-icons";
import { SendHorizonal, Copy, Mail, Check, Image as ImageIcon, Lightbulb, PenTool, Globe, Mic } from "lucide-react";
import { useUser } from "@/contexts/client/UserContext";
import { useDialog } from "@/contexts/client/DialogContext";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/client/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { assets } from "@/constants/assets";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import {
    fetchRecordingCounts,
    fetchAverageAudioDuration,
    fetchAverageScore,
    fetchAverageProcessingTime,
    fetchMonthlyData,
    fetchLatestCalls
} from '@/lib/apiClient';

type MonthlyDataItem = {
    _id: {
        month: number;
    };
    count: number;
};

type CallData = {
    callId: string;
    callTime: string;
    callScore: number;
};

interface DatabaseInfo {
    recordingCount: number | null;
    averageAudioDuration: string | null;
    averageScore: number | null;
    averageProcessingTime: string | null;
    monthlyData: MonthlyDataItem[];
    latestCalls: CallData[];
}


export default function ChatInterface() {
    const { firstName, profileIcon } = useUser();
    const { theme } = useTheme();
    const { dialog, addMessage, updateMessage } = useDialog();
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({
        recordingCount: null,
        averageAudioDuration: null,
        averageScore: null,
        averageProcessingTime: null,
        monthlyData: [],
        latestCalls: []
    });
    const [message, setMessage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [dialog, scrollToBottom]);

    const fetchDatabaseInfo = useCallback(async () => {
        if (!companyData?.database) return;

        try {
            const [
                recordingCounts,
                averageAudioDuration,
                averageScore,
                averageProcessingTime,
                monthlyData,
                latestCallsResponse
            ] = await Promise.all([
                fetchRecordingCounts(companyData.database),
                fetchAverageAudioDuration(companyData.database),
                fetchAverageScore(companyData.database),
                fetchAverageProcessingTime(companyData.database),
                fetchMonthlyData(companyData.database, new Date(new Date().getFullYear(), 0, 1), new Date(new Date().getFullYear(), 11, 31)),
                fetchLatestCalls(companyData.database, 1, 5)
            ]);

            setDatabaseInfo({
                recordingCount: recordingCounts.currentMonthCount,
                averageAudioDuration: averageAudioDuration.averageDurationText,
                averageScore: averageScore.averageScoreCurrentMonth,
                averageProcessingTime: averageProcessingTime.averageProcessingTimeText,
                monthlyData,
                latestCalls: latestCallsResponse.latestCalls
            });
        } catch (error) {
            console.error("Error fetching database info:", error);
        }
    }, [companyData?.database]);

    useEffect(() => {
        if (companyData) {
            fetchDatabaseInfo();
        }
    }, [companyData, fetchDatabaseInfo]);

    const handleSubmit = useCallback(async () => {
        if (message.trim().length < 1) return;
        const userMessage = message;
        setIsGenerating(true);
        setMessage("");
        const messageId = addMessage(userMessage, "");

        const chatHistory = [
            { role: "user", parts: [{ text: `Total calls this month: ${databaseInfo.recordingCount}` }] },
            { role: "user", parts: [{ text: `Average call duration: ${databaseInfo.averageAudioDuration}` }] },
            { role: "user", parts: [{ text: `Average call score: ${databaseInfo.averageScore}` }] },
            { role: "user", parts: [{ text: `Average processing time: ${databaseInfo.averageProcessingTime}` }] },
            { role: "user", parts: [{ text: userMessage }] },
        ];

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, chatHistory }),
            });
            if (!res.ok) throw new Error("Network error");
            const data = await res.json();
            updateMessage(messageId, data.response);
            scrollToBottom();
        } catch (error) {
            console.error("Error:", error);
            updateMessage(messageId, "An error occurred while generating the response.");
        } finally {
            setIsGenerating(false);
        }
    }, [message, addMessage, updateMessage, scrollToBottom, databaseInfo]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const suggestionCards = [
        { icon: <ImageIcon className="w-6 h-6" />, text: "Create an image & bedtime story" },
        { icon: <Lightbulb className="w-6 h-6" />, text: "What's the reaction to and impact of autonomous vehicles" },
        { icon: <PenTool className="w-6 h-6" />, text: "Create a splashy watercolor image" },
        { icon: <Globe className="w-6 h-6" />, text: "Find hotels in Phuket for a week, and suggest a packing list" },
    ];

    const handleCardClick = (text: string) => {
        setMessage(text);
        inputRef.current?.focus();
    };


    return (
        <div className="flex flex-col items-center justify-between h-screen w-full max-w-screen-lg mx-auto">
            <div className="flex-grow flex flex-col w-full">
                <ScrollArea className="flex-grow h-0 overflow-y-auto" ref={scrollAreaRef}>
                    {dialog.length === 0 && (
                        <div className="mb-12 transition-all duration-300 ease-in-out transform text-center">
                            <h1 className={`text-6xl font-bold mb-6 text-transparent bg-clip-text ${theme === "dark"
                                ? "bg-gradient-to-r from-[#13f287] to-[#b5ff57]"
                                : "bg-gradient-to-r from-[#13f287] to-[#b5ff57]"
                                }`}>
                                {t.chat.welcome}, {firstName}!
                            </h1>
                            <p className="text-2xl">
                                {t.chat.intro}
                            </p>
                        </div>
                    )}

                    {dialog.length === 0 && (
                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            {suggestionCards.map((card, index) => (
                                <Card
                                    key={index}
                                    className="flex-grow-0 flex-shrink-0 basis-[calc(25%-1rem)] p-6 flex flex-col justify-between rounded-xl cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                                    onClick={() => handleCardClick(card.text)}
                                >
                                    <p className="text-lg mb-4">{card.text}</p>
                                    <div className="text-3xl">{card.icon}</div>
                                </Card>
                            ))}
                        </div>

                    )}

                    {dialog.map((entry, index) => (
                        <div key={index} className="mb-8 transition-all duration-300 ease-in-out animate-fadeIn">
                            <Card className="backdrop-blur-sm p-4 bg-transparent rounded-lg flex items-start border-none">
                                <Avatar className="w-8 h-8 mr-3">
                                    {profileIcon ? (
                                        <AvatarImage src={profileIcon} alt="User Avatar" />
                                    ) : (
                                        <AvatarFallback>
                                            <PersonIcon className="w-5 h-5" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <p>{entry.message}</p>
                            </Card>
                            <Card className="backdrop-blur-sm p-4 bg-transparent rounded-lg flex items-start border-none mt-2">
                                <div className="flex items-start gap-3">
                                    <Image
                                        src={assets.gemini}
                                        alt="AI"
                                        width={25}
                                        height={25}
                                        className={`transition-all duration-300 ease-in-out ${isGenerating && index === dialog.length - 1 ? "animate-spin-slow mr-2" : ""}`}
                                    />
                                    {isGenerating && index === dialog.length - 1 ? (
                                        <div className="w-full space-y-2">
                                            <div className="w-3/4 h-4 bg-zinc-700 rounded animate-pulse"></div>
                                            <div className="w-2/4 h-4 bg-zinc-700 rounded animate-pulse"></div>
                                            <div className="w-1/4 h-4 bg-zinc-700 rounded animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <div className="text-sm space-y-2 flex-grow">
                                            <ReactMarkdown className="prose prose-invert">{entry.response}</ReactMarkdown>
                                            <div className="flex space-x-2 mt-4">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" onClick={() => handleCopy(entry.response)} className="transition-colors duration-200">
                                                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="center">
                                                            <p>{copied ? t.gemini.tooltip_copy_success : t.gemini.tooltip_copy}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" className="transition-colors duration-200">
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="center">
                                                            <p>{t.gemini.tooltip_email}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    ))}
                </ScrollArea>
            </div>
            <div className="fixed bottom-0 mb-4 w-full max-w-screen-lg">
                <div className="flex items-center space-x-2 bg-muted backdrop-blur-sm rounded-full p-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[hsl(var(--primary))] shadow-lg">
                    <input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder={t.placeholders.chatInput}
                        className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2"
                    />
                    <Button
                        size="icon"
                        onClick={() => inputRef.current?.click()}
                        className="bg-transparent hover:bg-card rounded-full p-2 transition-colors duration-200"
                    >
                        <ImageIcon className="h-5 w-5 text-secondary-foreground" />
                    </Button>
                    <Button
                        size="icon"
                        onClick={() => { }}
                        className="bg-transparent hover:bg-card rounded-full p-2 transition-colors duration-200"
                    >
                        <Mic className="h-5 w-5 text-secondary-foreground" />
                    </Button>

                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        className="rounded-full transition-colors duration-200 bg-accent hover:bg-accent/80"
                    >
                        <SendHorizonal className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}