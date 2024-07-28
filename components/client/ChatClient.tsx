  'use client'

  import React, { useState, useEffect, useCallback, useRef } from "react";
  import Image from "next/image";
  import { Button } from "@/components/ui/button";
  import { Pen, X, SendHorizonal, Copy, Mail, Check } from "lucide-react";
  import { useDialog } from "@/contexts/client/DialogContext";
  import { useUser } from "@/contexts/client/UserContext";
  import { assets } from "@/constants/assets";
  import { useTheme } from "next-themes";
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { PersonIcon } from "@radix-ui/react-icons";
  import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
  import { ChatCallPopoverProps, ChatAgentPopoverProps } from "@/types/PropsTypes";
  import ReactMarkdown from "react-markdown";
  import { Card } from "@/components/ui/card";
  import { useLanguage } from "@/contexts/client/LanguageContext";
  import { Textarea } from "@/components/ui/textarea";
  import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
  import {
    fetchRecordingCounts,
    fetchAverageAudioDuration,
    fetchAverageScore,
    fetchAverageProcessingTime,
    fetchMonthlyData,
    fetchLatestCalls
  } from '@/lib/apiClient';

  type ChatProps = ChatCallPopoverProps | ChatAgentPopoverProps;

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

  export default function ChatClient(props: ChatProps) {
    const { firstName, profileIcon, loading } = useUser();
    const { companyData } = useFetchUserCompanyDatabase();
    const { theme } = useTheme();
    const { dialog, addMessage, updateMessage } = useDialog();
    const [message, setMessage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [agentChatProps, setAgentChatProps] = useState<ChatAgentPopoverProps | null>(null);
    const [callChatProps, setCallChatProps] = useState<ChatCallPopoverProps | null>(null);
    const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
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
      tooltip_copy_success,
      tooltip_copy,
      tooltip_email,
      learn_more,
    } = t.gemini;

    const isCallProps = (props: ChatCallPopoverProps | ChatAgentPopoverProps): props is ChatCallPopoverProps => {
      return 'agentSegmentsText' in props;
    };
  
    if (isCallProps(props)) {
      // Handle call props
      console.log('Call props:', props.agentSegmentsText, props.clientSegmentsText);
    } else {
      // Handle agent props
      console.log('Agent props:', props.agentName, props.projectName);
    }
    
    const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({
      recordingCount: null,
      averageAudioDuration: null,
      averageScore: null,
      averageProcessingTime: null,
      monthlyData: [],
      latestCalls: []
    });

    const focusInput = useCallback(() => {
      const inputElement = document.querySelector("input[type='text']") as HTMLInputElement;
      inputElement?.focus();
    }, []);

    const scrollToBottom = useCallback(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, []);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, []);

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
      if (popoverOpen) {
        focusInput();
      }
    }, [popoverOpen, focusInput]);



    useEffect(() => {
      if (scrollContainerRef.current && isAtBottom) {
        scrollToBottom();
      }
    }, [dialog, isAtBottom, scrollToBottom]);

    useEffect(() => {
      adjustTextareaHeight();
    }, [message, adjustTextareaHeight]);

    useEffect(() => {
      if (companyData) {
        fetchDatabaseInfo();
      }
    }, [companyData, fetchDatabaseInfo]);



    useEffect(() => {
      const handleChatPropsChange = (event: CustomEvent<ChatCallPopoverProps | ChatAgentPopoverProps>) => {
        if (event.detail) {
          if ('agentName' in event.detail) {
            // This is ChatAgentPopoverProps
            setAgentChatProps(event.detail);
            setCallChatProps(null); // Clear callChatProps when agent props are set
          } else {
            // This is ChatCallPopoverProps
            setCallChatProps(event.detail);
            setAgentChatProps(null); // Clear agentChatProps when call props are set
          }
        } else {
          setCallChatProps(null);
          setAgentChatProps(null);
        }
      };
    
      window.addEventListener('chatPropsChange', handleChatPropsChange as EventListener);
      window.addEventListener('agentChatPropsChange', handleChatPropsChange as EventListener);
    
      return () => {
        window.removeEventListener('chatPropsChange', handleChatPropsChange as EventListener);
        window.removeEventListener('agentChatPropsChange', handleChatPropsChange as EventListener);
      };
    }, []);

    const handleSubmit = useCallback(async () => {
      if (message.trim().length < 3) return;
      const userMessage = message;
      setIsGenerating(true);
      setMessage("");
      const messageId = addMessage(userMessage, "");
    
      let chatHistory;
      if (agentChatProps) {
        // This is ChatAgentPopoverProps
        chatHistory = [
          { role: "user", parts: [{ text: `Agent Name: ${agentChatProps.agentName}` }] },
          { role: "user", parts: [{ text: `Project Name: ${agentChatProps.projectName}` }] },
          { role: "user", parts: [{ text: `Username: ${agentChatProps.username}` }] },
          { role: "user", parts: [{ text: `Total Calls: ${agentChatProps.totalCalls}` }] },
          { role: "user", parts: [{ text: `Average Score: ${agentChatProps.averageScore}` }] },
          { role: "user", parts: [{ text: `Average Call Duration: ${agentChatProps.averageCallDuration}` }] },
          { role: "user", parts: [{ text: `Average Processing Time: ${agentChatProps.averageProcessingTime}` }] },
          { role: "user", parts: [{ text: `Percentage Change: ${agentChatProps.percentageChange}` }] },
          { role: "user", parts: [{ text: `Audio Duration Change: ${agentChatProps.audioDurationChange}` }] },
          { role: "user", parts: [{ text: `Average Score Change: ${agentChatProps.averageScoreChange}` }] },
          { role: "user", parts: [{ text: `Processing Time Change: ${agentChatProps.processingTimeChange}` }] },
          { role: "user", parts: [{ text: `Score Trend: ${JSON.stringify(agentChatProps.scoreTrend)}` }] },
          { role: "user", parts: [{ text: `Connection Status: ${agentChatProps.connectionStatus}` }] },
          { role: "user", parts: [{ text: `Agent Summary: ${agentChatProps.agentSummary}` }] },
          { role: "user", parts: [{ text: `Total Calls This Month: ${agentChatProps.totalCallsThisMonth}` }] },
          { role: "user", parts: [{ text: userMessage }] },
        ];
      } else if (callChatProps) {
        // This is ChatCallPopoverProps
        const frequentWordsText = callChatProps.mostFrequentWords
          ? callChatProps.mostFrequentWords
            .map((word, index) => `${index + 1}. **${word.word}**: ${word.count} ${occurrences}`)
            .join("\n")
          : "";
    
        chatHistory = [
          { role: "user", parts: [{ text: `${agentName} ${callChatProps.agent_info?.first_name || ''} ${callChatProps.agent_info?.last_name || ''}` }] },
          { role: "user", parts: [{ text: `${projectName} ${callChatProps.agent_info?.project || ''}` }] },
          { role: "user", parts: [{ text: `${agentText} ${callChatProps.agentSegmentsText}` }] },
          { role: "user", parts: [{ text: `${clientText} ${callChatProps.clientSegmentsText}` }] },
          { role: "user", parts: [{ text: `${sentimentAverage} ${callChatProps.averageSentimentScore?.toFixed(2) || '0.00'} ${sentimentScale}` }] },
          { role: "user", parts: [{ text: `${frequentWords}\n${frequentWordsText}` }] },
          { role: "user", parts: [{ text: `Total calls this month: ${databaseInfo.recordingCount}` }] },
          { role: "user", parts: [{ text: `Average call duration: ${databaseInfo.averageAudioDuration}` }] },
          { role: "user", parts: [{ text: `Average call score: ${databaseInfo.averageScore}` }] },
          { role: "user", parts: [{ text: `Average processing time: ${databaseInfo.averageProcessingTime}` }] },
          { role: "user", parts: [{ text: userMessage }] },
        ];
      } else {
        // Handle the case where neither props are available
        chatHistory = [{ role: "user", parts: [{ text: userMessage }] }];
      }
    
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
        console.error("Error:", error);
        updateMessage(messageId, generate_error);
      } finally {
        setIsGenerating(false);
      }
    }, [
      message,
      addMessage,
      agentChatProps,
      callChatProps,
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
      updateMessage,
      databaseInfo,
      setIsAtBottom,
      setIsGenerating
    ]);

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

    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    const handleToggleChat = () => {
      setPopoverOpen((prev) => !prev);
    };

    if (loading) {
      return <div>{t.loading.loadingPage}</div>;
    }

    return (
      <Sheet open={popoverOpen} onOpenChange={handleToggleChat}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 rounded-full bg-accent h-14 w-14 flex items-center justify-center hover:shadow-lg z-50 hover:bg-accent/90"
            aria-expanded={popoverOpen}
            aria-controls="chat-call-popover"
            aria-label="Open chat"
          >
            {popoverOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Pen className="h-6 w-6" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          id="chat-call-popover"
          className="z-[998] flex flex-col h-full w-full md:max-w-lg p-4 transition-all duration-300 ease-in-out"
        >
          <SheetHeader>
            <SheetTitle>
              {firstName && (
                <div className="mb-4 text-left md:text-left">
                  <div
                    className={`text-4xl font-bold text-transparent bg-clip-text ${theme === "dark"
                        ? "bg-gradient-to-r from-[#13f287] to-[#b5ff57]"
                        : "bg-gradient-to-r from-[#13f287] to-[#b5ff57]"
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
                  className={`p-4 border-none flex items-center bg-transparent`}
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
                  className={`mt-2 p-4 border-none bg-transparent`}
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
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
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
            <a href="#" className="text-accent">{learn_more}</a>
          </p>
        </SheetContent>
      </Sheet>
    );
  }