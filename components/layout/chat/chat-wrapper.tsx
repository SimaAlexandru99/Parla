// File: components/ChatWrapper.tsx
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
  const [chatProps, setChatProps] = useState<ChatCallPopoverProps | null>(null);

  useEffect(() => {
    const handleChatPropsChange = (event: ChatPropsChangeEvent) => {
      setChatProps(event.detail);
    };

    window.addEventListener('chatPropsChange', handleChatPropsChange as EventListener);

    return () => {
      window.removeEventListener('chatPropsChange', handleChatPropsChange as EventListener);
    };
  }, []);

  // Only render ChatClient if we have props
  return chatProps ? <ChatClient {...chatProps} /> : null;
}