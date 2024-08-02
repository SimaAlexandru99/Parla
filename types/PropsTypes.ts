// Define the Segment interface
export interface Segment {
  speaker: string;
  time_range: { start: number; end: number };
  transcription: string;
  sentiment: "positive" | "negative" | "neutral"; // Assuming these are the only possible values
  key_phrases: string[];
  entities: string[];
  sentiment_score: number;
  type_speaker: string;
}

// Define the CallDetails interface
export interface CallDetails {
  _id: string;
  project_id?: string; // New field for file uploads
  filename?: string; 
  phone_number: string;
  agent_info: {
    username: string;
    first_name: string;
    last_name: string;
    project: string;
  };
  score: number;
  file_info: {
    extension: string;
    duration: number;
    day: string;
    file_path: string;
  };
  segments: Segment[];
  day_processed?: string | Date; // Consider using Date if this is a date
  average_sentiment: number;
  crosstalk_duration: number;
  total_dead_air_duration: {
    SPEAKER_00: number;
    SPEAKER_01: number;
  };
  total_talk_duration: {
    SPEAKER_00: number;
    SPEAKER_01: number;
  };
  status: 'completed' | 'to_process' | 'failed' | 'new' | 'processing'; // Added 'new' status
  call_summary: string;
}

// Define the WordCount interface
export interface WordCount {
  word: string;
  count: number;
}

// Define the ChatCallPopoverProps interface
export interface ChatCallPopoverProps {
  
  segments?: Segment[];
  agentSegmentsText?: string;
  clientSegmentsText?: string;
  averageSentimentScore?: number;
  mostFrequentWords?: WordCount[];
  agent_info?: {
    first_name: string;
    last_name: string;
    project: string;
  };
}

// Define the ChatAgentPopoverProps interface
export interface ChatAgentPopoverProps {
  agentName: string;
  projectName: string;
  username: string;
  totalCalls: number;
  averageScore: number;
  averageCallDuration: string;
  averageProcessingTime: string;
  percentageChange: string;
  audioDurationChange: string;
  averageScoreChange: string;
  processingTimeChange: string;
  scoreTrend: { percentage: number; trending: 'up' | 'down' | 'neutral' };
  connectionStatus?: string;
  agentSummary?: string;
  totalCallsThisMonth?: number;
}

// Define the AgentDetails interface
export interface AgentDetails {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  project: string;
}

// Define the DataCardProps interface
export interface DataCardProps {
  icon: JSX.Element;
  title: string;
  value: string | number | null;
  change: string | null;
  loading: boolean;
}

// Define the SkeletonCardProps interface
export interface SkeletonCardProps {
  className: string;
}

// Define the ProjectDetails interface
export interface ProjectDetails {
  _id: string;
  project_name: string;
  greetings_words: string[];
  companies_names: string[];
  availability_words: string[];
  from_what_company: string[];
  positive_words: string[];
  negative_words: string[];
  common_words: string[];
  words_to_remove: string[];
  analyze_agent_presented: boolean;
  analyze_company_presented: boolean;
  analyze_client_availability: boolean;
  analyze_from_what_company: boolean;
  agentsCount: number;
}