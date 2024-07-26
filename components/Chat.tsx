'use client'

import { useState, useEffect } from 'react';
import { ChatCallPopoverProps, ChatAgentPopoverProps } from "@/types/PropsTypes";
import ChatClient from "./client/ChatClient";

type ChatProps = ChatCallPopoverProps | ChatAgentPopoverProps;

interface ChatPropsChangeEvent extends CustomEvent {
  detail: ChatProps | null;
}

const defaultChatProps: ChatCallPopoverProps = {
  agentSegmentsText: "",
  clientSegmentsText: "",
  averageSentimentScore: 0,
  mostFrequentWords: [],
  agent_info: { first_name: "", last_name: "", project: "" },
};

export default function ChatWrapper() {
  const [chatProps, setChatProps] = useState<ChatProps>(defaultChatProps);

  useEffect(() => {
    const handleChatPropsChange = (event: ChatPropsChangeEvent) => {
      if (event.detail) {
        setChatProps(event.detail);
      } else {
        setChatProps(defaultChatProps);
      }
    };

    window.addEventListener('chatPropsChange', handleChatPropsChange as EventListener);

    return () => {
      window.removeEventListener('chatPropsChange', handleChatPropsChange as EventListener);
    };
  }, []);

  return <ChatClient {...chatProps} />;
}