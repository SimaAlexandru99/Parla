
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pen, X, SendHorizonal, Copy, ThumbsUp, ThumbsDown, Mail, Check } from "lucide-react";
import { useDialog } from "@/contexts/DialogContext";
import { useUser } from "@/contexts/UserContext";
import { assets } from "@/constants/assets";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonIcon } from "@radix-ui/react-icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ChatCallPopoverProps } from "@/types/PropsTypes";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Textarea } from "@/components/ui/textarea";
import PositiveFeedbackCard from "./Cards/PositiveFeedbackCard";
import NegativeFeedbackCard from "./Cards/NegativeFeedbackCard";


function ChatCallPopover({
    agentSegmentsText,
    clientSegmentsText,
    averageSentimentScore,
    mostFrequentWords,
    agent_info,
}: ChatCallPopoverProps) {
    const { firstName, project, profileIcon, loading } = useUser();
    const { theme } = useTheme();
    const { dialog, addMessage, updateMessage } = useDialog();
    const [message, setMessage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [activeFeedbackCard, setActiveFeedbackCard] = useState<string | null>(null);
    const [selectedButton, setSelectedButton] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    const {
        agentName,
        projectName,
        agentText,
        clientText,
        sentimentAverage,
        sentimentScale,
        frequentWords,
        occurrences,
        network_error,
        generate_error,
        tooltip_feedback_thumbs_up,
        tooltip_feedback_thumbs_down,
        tooltip_copy_success,
        tooltip_copy,
        tooltip_email,
        feedback_headline,
        feedback_buttons,
        feedback_note,
        learn_more,
    } = t.gemini;

    const focusInput = useCallback(() => {
        const inputElement = document.querySelector("input[type='text']") as HTMLInputElement;
        inputElement?.focus();
    }, []);

    const scrollToBottom = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (popoverOpen) {
            focusInput();
        }
    }, [popoverOpen, focusInput]);

    useEffect(() => {
        if (scrollContainerRef.current && isAtBottom) {
            scrollToBottom();
        }
    }, [dialog, isAtBottom, scrollToBottom]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    useEffect(() => {
        adjustTextareaHeight();
    }, [message, adjustTextareaHeight]);

    const handleSubmit = useCallback(async () => {
        if (message.trim().length < 3) return;
        const userMessage = message;
        setIsGenerating(true);
        setMessage("");
        const messageId = addMessage(userMessage, "");

        const frequentWordsText = mostFrequentWords
            .map((word, index) => `${index + 1}. **${word.word}**: ${word.count} ${occurrences}`)
            .join("\n");

        const chatHistory = [
            { role: "user", parts: [{ text: `${agentName} ${agent_info.first_name} ${agent_info.last_name}` }] },
            { role: "user", parts: [{ text: `${projectName} ${project}` }] },
            { role: "user", parts: [{ text: `${agentText} ${agentSegmentsText}` }] },
            { role: "user", parts: [{ text: `${clientText} ${clientSegmentsText}` }] },
            {
                role: "user",
                parts: [
                    {
                        text: `${sentimentAverage} ${averageSentimentScore.toFixed(2)} ${sentimentScale}`,
                    },
                ],
            },
            { role: "user", parts: [{ text: `${frequentWords}\n${frequentWordsText}` }] },
            { role: "user", parts: [{ text: userMessage }] },
        ];

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, chatHistory }),
            });
            if (!res.ok) throw new Error(network_error);
            const data = await res.json();
            updateMessage(messageId, data.response);
            setIsAtBottom(true);
        } catch (error) {
            console.error("Eroare:", error);
            updateMessage(messageId, generate_error);
        } finally {
            setIsGenerating(false);
        }
    }, [
        message,
        addMessage,
        mostFrequentWords,
        agentName,
        projectName,
        agentText,
        clientText,
        sentimentAverage,
        sentimentScale,
        frequentWords,
        occurrences,
        network_error,
        generate_error,
        agent_info.first_name,
        agent_info.last_name,
        project,
        agentSegmentsText,
        clientSegmentsText,
        averageSentimentScore,
        updateMessage,
    ]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    const clearInput = useCallback(() => {
        setMessage("");
        focusInput();
    }, [focusInput]);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
        }
    }, []);

    const handleFeedbackClick = (type: string, index: string) => {
        setSelectedButton(type);
        setActiveFeedbackCard(index);
    };

    const handleFeedbackSubmit = () => {
        setActiveFeedbackCard(null);
        // Handle feedback submission logic here
    };

    const handleButtonClick = (button: string) => {
        setSelectedButton(button);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) {
        return <div>{t.loading.loadingPage}</div>;
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="rounded-full h-14 w-14 flex items-center justify-center hover:shadow-lg"
                    aria-expanded={popoverOpen}
                    aria-controls="chat-call-popover"
                    aria-label="Open chat"
                    onClick={() => setPopoverOpen(!popoverOpen)}
                >
                    {popoverOpen ? (
                        <X className="h-6 w-6 " />
                    ) : (
                        <Pen className="h-6 w-6 " />
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent
                id="chat-call-popover"
                className="flex flex-col h-full w-full md:max-w-lg p-4 transition-all duration-300 ease-in-out"
            >
                <SheetHeader>
                    <SheetTitle>
                        {firstName && (
                            <div className="mb-4 text-left md:text-left">
                                <div
                                    className={`text-4xl font-bold text-transparent bg-clip-text ${theme === "dark"
                                        ? "bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]"
                                        : "bg-gradient-to-r from-[#5684D1] to-[#1BA1E3]"
                                        }`}
                                >
                                    {t.chat.welcome}, {firstName}!
                                </div>
                                <div className={`text-4xl ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
                                    {t.chat.intro}
                                </div>
                            </div>
                        )}
                    </SheetTitle>
                </SheetHeader>
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 h-full w-full rounded-md overflow-y-auto"
                >
                    {dialog.map((entry, index) => (
                        <div key={index} className="mb-4">
                            <Card
                                className={`p-4 border-none
                                     flex items-center`}
                            >
                                <Avatar className="w-10 h-10 cursor-pointer" aria-label="User avatar">
                                    {profileIcon ? (
                                        <AvatarImage src={profileIcon} alt="User Avatar" />
                                    ) : (
                                        <AvatarFallback>
                                            <PersonIcon className="w-5 h-5" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <p className="ml-2" aria-label="User message">{entry.message}</p>
                            </Card>
                            <Card
                                className={`mt-2 p-4 border-none`}
                            >
                                <div className="mb-2 flex items-start gap-2">
                                    <Image
                                        src={assets.gemini}
                                        alt="Gemini"
                                        width={25}
                                        height={25}
                                        className={
                                            isGenerating && index === dialog.length - 1
                                                ? "animate-spin-slow mr-2"
                                                : "transition-all ease-in duration-500"
                                        }
                                    />
                                    {isGenerating && index === dialog.length - 1 ? (
                                        <div className="w-full space-y-2" aria-busy="true">
                                            <div className="w-3/4 h-4 skeleton"></div>
                                            <div className="w-2/4 h-4 skeleton"></div>
                                            <div className="w-1/4 h-4 skeleton"></div>
                                        </div>
                                    ) : (
                                        <div className="text-sm fade-in space-y-2">
                                            <ReactMarkdown>{entry.response}</ReactMarkdown>
                                            <div className="mt-2 flex space-x-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleFeedbackClick("thumbsUp", index.toString())}
                                                                aria-label="Thumbs up feedback"
                                                            >
                                                                <ThumbsUp className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="center">
                                                            <p>{tooltip_feedback_thumbs_up}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleFeedbackClick("thumbsDown", index.toString())}
                                                                aria-label="Thumbs down feedback"
                                                            >
                                                                <ThumbsDown className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="center">
                                                            <p>{tooltip_feedback_thumbs_down}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleCopy(entry.response)}
                                                                aria-label="Copy response"
                                                            >
                                                                {copied ? (
                                                                    <Check className="h-4 w-4" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="center">
                                                            <p>{copied ? tooltip_copy_success : tooltip_copy}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon" aria-label="Email response">
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="center">
                                                            <p>{tooltip_email}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                            {activeFeedbackCard === index.toString() && selectedButton === "thumbsUp" && (
                                <PositiveFeedbackCard
                                    index={index.toString()}
                                    handleFeedbackClick={handleFeedbackClick}
                                    handleButtonClick={handleButtonClick}
                                    handleFeedbackSubmit={handleFeedbackSubmit}
                                    setActiveFeedbackCard={setActiveFeedbackCard}
                                    activeFeedbackCard={activeFeedbackCard}
                                    selectedButton={selectedButton}
                                    t={t.gemini} // Pass the translation object here
                                />
                            )}
                            {activeFeedbackCard === index.toString() && selectedButton === "thumbsDown" && (
                                <NegativeFeedbackCard
                                    index={index.toString()}
                                    handleFeedbackClick={handleFeedbackClick}
                                    handleButtonClick={handleButtonClick}
                                    handleFeedbackSubmit={handleFeedbackSubmit}
                                    setActiveFeedbackCard={setActiveFeedbackCard}
                                    activeFeedbackCard={activeFeedbackCard}
                                    selectedButton={selectedButton}
                                    t={t.gemini} // Pass the translation object here
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="relative mt-4 w-full">
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                adjustTextareaHeight();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder={t.placeholders.chatInput}
                            className="w-full rounded-xl py-3 px-6 pr-24 transition-all duration-300 ease-in-out resize-none overflow-hidden min-h-[48px] max-h-[200px] text-base leading-6"
                            aria-label="Chat input"
                        />
                        <div className="absolute right-2 bottom-1.5 flex items-center space-x-2">
                            {message && (
                                <Button
                                    onClick={clearInput}
                                    className={`p-1.5 ${theme === "dark" ? "text-white" : "text-black"} hover:bg-gray-600 hover:text-white rounded-full`}
                                    variant="ghost"
                                    aria-label="Clear input"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            onClick={handleSubmit}
                                            className={`p-1.5 ${theme === "dark" ? "text-white" : "text-black"} hover:bg-gray-600 hover:text-white rounded-full ${message.length >= 3 ? "opacity-100" : "opacity-0"}`}
                                            disabled={message.length < 3}
                                            aria-label="Send message"
                                        >
                                            <SendHorizonal className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center">
                                        <p>{t.buttons.submit}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
                <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-700"}`}>
                    {t.chat.disclaimer}
                    <a href="#" className="text-violet-500">{learn_more}</a>
                </p>
            </SheetContent>
        </Sheet>
    );
}

export default ChatCallPopover;
