// File: components/chat-wrapper.tsx
'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChatCallPopoverProps } from "@/types/PropsTypes";

// Dynamically import ChatClient with no SSR
const ChatClient = dynamic(() => import('./chat-client'), { ssr: false });

interface ChatPropsChangeEvent extends CustomEvent {
  detail: ChatCallPopoverProps;
}

export default function ChatWrapper() {
  const [chatProps, setChatProps] = useState<ChatCallPopoverProps>({
    agentSegmentsText: "",
    clientSegmentsText: "",
    averageSentimentScore: 0,
    mostFrequentWords: [],
    agent_info: { first_name: "", last_name: "", project: "" },
  });

  useEffect(() => {
    const handleChatPropsChange = (event: ChatPropsChangeEvent) => {
      setChatProps(event.detail);
    };

    window.addEventListener('chatPropsChange', handleChatPropsChange as EventListener);

    return () => {
      window.removeEventListener('chatPropsChange', handleChatPropsChange as EventListener);
    };
  }, []);

  // Always render ChatClient, even with default empty props
  return <ChatClient {...chatProps} />;
}
