'use client'

import { useState, useEffect } from 'react';
import { ChatCallPopoverProps, ChatAgentPopoverProps } from "@/types/PropsTypes";
import ChatClient from "./client/ChatClient";

const defaultCallProps: ChatCallPopoverProps = {
  segments: [],
  agentSegmentsText: "",
  clientSegmentsText: "",
  averageSentimentScore: 0,
  mostFrequentWords: [],
  agent_info: { first_name: "", last_name: "", project: "" },
};

const defaultAgentProps: ChatAgentPopoverProps = {
  agentName: "",
  projectName: "",
  username: "",
  totalCalls: 0,
  averageScore: 0,
  averageCallDuration: "",
  averageProcessingTime: "",
  percentageChange: "",
  audioDurationChange: "",
  averageScoreChange: "",
  processingTimeChange: "",
  scoreTrend: { percentage: 0, trending: 'neutral' },
};

type ChatProps = ChatCallPopoverProps | ChatAgentPopoverProps;

export default function ChatWrapper() {
  const [chatProps, setChatProps] = useState<ChatProps>(defaultCallProps);

  useEffect(() => {
    const handleChatPropsChange = (event: CustomEvent<ChatProps>) => {
      if (event.detail) {
        setChatProps(event.detail);
      } else {
        setChatProps(defaultCallProps);
      }
    };

    window.addEventListener('chatPropsChange', handleChatPropsChange as EventListener);
    window.addEventListener('agentChatPropsChange', handleChatPropsChange as EventListener);

    return () => {
      window.removeEventListener('chatPropsChange', handleChatPropsChange as EventListener);
      window.removeEventListener('agentChatPropsChange', handleChatPropsChange as EventListener);
    };
  }, []);

  return <ChatClient {...chatProps} />;
}