// types/AgentMetrics.ts
export interface VisualizationData {
  time: string;
  value: number;
}

export interface AgentMetrics {
  sentimentData: VisualizationData[];
  deadAirData: VisualizationData[];
  talkDurationData: VisualizationData[];
  avgSentiment: number;
  totalDeadAirSpeaker00: number;
  totalTalkDurationSpeaker00: number;
}
