import { ReactNode } from 'react';

// Basic chat message structure
export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

// Chat dialog structure
export type ChatDialog = ChatMessage[];

// Base props for chat components
export interface BaseChatProps {
  agentName: string;
  projectName: string;
}

// Props specific to the ChatAgentPopover component
export interface ChatAgentPopoverProps extends BaseChatProps {
  username: string;
}

// Props for the ChatServer component
export interface ChatServerProps extends BaseChatProps {
  agentSegmentsText?: string;
  clientSegmentsText?: string;
  averageSentimentScore?: number;
  mostFrequentWords?: WordCount[];
  agent_info?: {
    first_name: string;
    last_name: string;
    project: string;
  };
  username?: string;
}

// Union type for all possible chat props
export type ChatProps = BaseChatProps | ChatAgentPopoverProps | ChatServerProps;

// Structure for word count
export interface WordCount {
  word: string;
  count: number;
}

// Database info structure
export interface DatabaseInfo {
  recordingCount: number | null;
  averageAudioDuration: string | null;
  averageScore: number | null;
  averageProcessingTime: string | null;
  monthlyData: MonthlyDataItem[];
  latestCalls: CallData[];
}

// Monthly data item structure
export interface MonthlyDataItem {
  _id: {
    month: number;
  };
  count: number;
}

// Call data structure
export interface CallData {
  callId: string;
  callTime: string;
  callScore: number;
}

// Context for managing dialog state
export interface DialogContextType {
  dialog: ChatDialog;
  addMessage: (message: string, response: string) => string;
  updateMessage: (id: string, response: string) => void;
}

// Props for the DialogProvider component
export interface DialogProviderProps {
  children: ReactNode;
}