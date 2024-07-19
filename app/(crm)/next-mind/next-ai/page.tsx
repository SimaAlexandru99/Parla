'use client'

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonIcon } from "@radix-ui/react-icons";
import { SendHorizonal, ThumbsUp, ThumbsDown, Copy, Mail, Check, Image as ImageIcon, Lightbulb, PenTool, Globe, Mic } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { DialogProvider, useDialog } from "@/contexts/DialogContext";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { assets } from "@/constants/assets";

function ChatInterface() {
    const { firstName, profileIcon } = useUser();
    const { theme } = useTheme();
    const { dialog, addMessage, updateMessage } = useDialog();
    const { t } = useLanguage();
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

    const handleSubmit = useCallback(async () => {
        if (message.trim().length < 1) return;
        const userMessage = message;
        setIsGenerating(true);
        setMessage("");
        const messageId = addMessage(userMessage, "");

        const chatHistory = [
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
    }, [message, addMessage, updateMessage, scrollToBottom]);

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
        <div className="flex flex-col justify-center h-full">
            <ScrollArea className="flex md:px-0 h-[69vh] max-w-4xl justify-center mx-auto pb-4 ">
                {dialog.length === 0 && (
                    <div className="mb-12 transition-all duration-300 ease-in-out transform">
                        <h1 className={`text-6xl font-bold mb-6 text-transparent bg-clip-text ${theme === "dark"
                            ? "bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]"
                            : "bg-gradient-to-r from-[#5684D1] to-[#1BA1E3]"
                            }`}>
                            {t.chat.welcome}, {firstName}!
                        </h1>
                        <p className="text-2xl">
                            {t.chat.intro}
                        </p>
                    </div>
                )}

                {dialog.length === 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        {suggestionCards.map((card, index) => (
                            <Card
                                key={index}
                                className="p-6 flex flex-col justify-between rounded-xl cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--primary))]"
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
                        <Card className="backdrop-blur-sm p-4 rounded-lg flex items-start border-none">
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
                        <Card className="backdrop-blur-sm p-4 rounded-lg flex items-start border-none mt-2">
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
                                                        <Button variant="outline" size="icon" className="transition-colors duration-200">
                                                            <ThumbsUp className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" align="center">
                                                        <p>{t.gemini.tooltip_feedback_thumbs_up}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="transition-colors duration-200">
                                                            <ThumbsDown className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" align="center">
                                                        <p>{t.gemini.tooltip_feedback_thumbs_down}</p>
                                                    </TooltipContent>
                                                </Tooltip>
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
            <div className="p-4 flex w-full justify-center">
                <div className="flex items-center space-x-2 max-w-4xl w-full bg-zinc-800/80 backdrop-blur-sm rounded-full p-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[hsl(var(--primary))] shadow-lg">
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
                        className="flex-1 bg-transparent border-none focus:outline-none  px-4 py-2"
                    />
                    <Button onClick={() => inputRef.current?.click()} className="bg-transparent hover:bg-zinc-700/50 rounded-full p-2 transition-colors duration-200">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button onClick={() => { }} className="bg-transparent hover:bg-zinc-700/50 rounded-full p-2 transition-colors duration-200">
                        <Mic className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className=" rounded-full p-2 transition-colors duration-200"
                    >
                        <SendHorizonal className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function NextAIPage() {
    return (
        <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6' >
            <DialogProvider>
                <ChatInterface />
            </DialogProvider>
        </div >
    );
}
