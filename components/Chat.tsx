'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChatAgentPopoverProps, ChatProps, BasePopoverProps } from "@/types/ChatTypes";

const ChatServer = dynamic(() => import('@/components/server/ChatServer'), { ssr: false });

interface ChatPropsChangeEvent extends CustomEvent {
  detail: ChatProps | null;
}

const defaultChatProps: BasePopoverProps = {
  agentName: "",
  projectName: "",
};

function isAgentProps(props: ChatProps): props is ChatAgentPopoverProps {
  return 'username' in props;
}

export default function Chat() {
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

  return <ChatServer 
    {...(isAgentProps(chatProps) 
      ? chatProps 
      : { ...defaultChatProps, ...chatProps }
    )} 
  />;
}