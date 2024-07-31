// apiClients.ts
import { AgentMetrics } from "@/types/AgentMetrics";
import { CallDetails, ProjectDetails } from "@/types/PropsTypes"; // Ensure this import path is correct

export interface RecordingCounts {
  currentMonthCount: number;
  lastMonthCount: number;
}

export interface AverageAudioDuration {
  averageDurationText: string;
  averageDurationInSecondsCurrentMonth: number;
  averageDurationInSecondsLastMonth: number;
}

export interface AverageScore {
  averageScoreCurrentMonth: number;
  averageScoreLastMonth: number;
}

export interface AverageProcessingTime {
  averageProcessingTimeText: string;
  averageProcessingTimeInSecondsCurrentMonth: number;
  averageProcessingTimeInSecondsLastMonth: number;
}

export interface MonthlyDataItem {
  _id: {
    month: number;
  };
  count: number;
}

export const checkMongoConnection = async (): Promise<{ status: string }> => {
  const response = await fetch("/api/check-mongodb");
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

export const fetchRecordingCounts = async (
  database: string,
  username?: string
): Promise<RecordingCounts> => {
  const url = new URL(`/api/count-call-recordings`, window.location.origin);
  url.searchParams.append("database", database);
  if (username) {
    url.searchParams.append("username", username);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchLatestCalls = async (
  database: string,
  page: number,
  limit: number
) => {
  const response = await fetch(
    `/api/latest-calls?database=${database}&page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const deleteLatestCall = async (
  database: string,
  id: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `/api/latest-calls?database=${database}&id=${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete call");
  }

  return await response.json();
};

export const fetchAgents = async (
  database: string,
  page: number,
  limit: number,
  searchTerm?: string
) => {
  const url = new URL(`/api/agents`, window.location.origin);
  url.searchParams.append("database", database);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.append("search", searchTerm);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchCalls = async (
  database: string,
  page: number,
  limit: number,
  searchTerm?: string
) => {
  const url = new URL(`/api/calls`, window.location.origin);
  url.searchParams.append("database", database);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.append("search", searchTerm);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchProjects = async (
  database: string,
  page: number,
  limit: number,
  searchTerm?: string
): Promise<{ projects: ProjectDetails[]; totalProjects: number }> => {
  const url = new URL(`/api/projects`, window.location.origin);
  url.searchParams.append("database", database);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  if (searchTerm) {
    url.searchParams.append("search", searchTerm);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  const data = await response.json();
  return {
    projects: data.projects as ProjectDetails[],
    totalProjects: data.totalProjects,
  };
};

export const deleteCall = async (
  database: string,
  id: string
): Promise<{ message: string }> => {
  const response = await fetch(`/api/calls?database=${database}&id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete call");
  }

  return await response.json();
};

export const fetchAverageAudioDuration = async (
  database: string,
  username?: string
): Promise<AverageAudioDuration> => {
  const url = new URL(`/api/average-audio-duration`, window.location.origin);
  url.searchParams.append("database", database);
  if (username) {
    url.searchParams.append("username", username);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchAverageScore = async (
  database: string,
  username?: string
): Promise<AverageScore> => {
  const url = new URL(`/api/average-score`, window.location.origin);
  url.searchParams.append("database", database);
  if (username) {
    url.searchParams.append("username", username);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchAgentScores = async (
  database: string,
  username: string
): Promise<{ month: string; score: number }[]> => {
  const url = new URL(`/api/agent-scores`, window.location.origin);
  url.searchParams.append("database", database);
  url.searchParams.append("username", username);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchAverageProcessingTime = async (
  database: string,
  username?: string
): Promise<AverageProcessingTime> => {
  const url = new URL(`/api/average-processing-time`, window.location.origin);
  url.searchParams.append("database", database);
  if (username) {
    url.searchParams.append("username", username);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }
  return await response.json();
};

export const fetchAgentSummary = async (
  database: string,
  agentName: string,
  agentUsername: string,
  language: string,
  recordingCount: number,
  percentageChange: string,
  averageAudioDuration: string,
  averageScore: number,
  averageProcessingTime: string
): Promise<{ summary: string }> => {
  const url = new URL(`/api/agent-analytics-summary`, window.location.origin);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      database,
      agentName,
      agentUsername,
      language,
      recordingCount,
      percentageChange,
      averageAudioDuration,
      averageScore,
      averageProcessingTime,
    }),
  });

  if (!response.ok) {
    throw new Error("Server error while processing the request");
  }

  return await response.json();
};

export const fetchMonthlyData = async (
  database: string,
  startDate: Date,
  endDate: Date
): Promise<MonthlyDataItem[]> => {
  const response = await fetch(
    `/api/calls-by-month?database=${database}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

export const fetchCountByDateRange = async (
  database: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<number> => {
  const response = await fetch(
    `/api/count-by-date-range?database=${database}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

export const fetchAverageAudioDurationByDateRange = async (
  database: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<{ averageDurationText: string }> => {
  const response = await fetch(
    `/api/average-by-date-range?database=${database}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

export const fetchScores = async (
  database: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<number[]> => {
  const response = await fetch(
    `/api/scores-by-date-range?database=${database}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  return data.scores; // Assuming your API returns an array of scores
};

export const fetchAverageSentimentByDateRange = async (
  database: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<{ averageSentiment: number }> => {
  const response = await fetch(
    `/api/average-sentiment-by-date-range?database=${database}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

export const fetchCallDurationData = async (
  database: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<any[]> => {
  const response = await fetch(
    `/api/call-duration-data?database=${database}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
  );
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

export const fetchAgentMetrics = async (
  database: string,
  username: string
): Promise<AgentMetrics> => {
  const response = await fetch(
    `/api/agent-metrics?database=${database}&username=${username}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch agent metrics");
  }
  return await response.json();
};

export const fetchProjectDetails = async (
  database: string,
  projectId: string
): Promise<ProjectDetails> => {
  const url = new URL(`/api/projects/${projectId}`, window.location.origin);
  url.searchParams.append("database", database);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch project details");
  }
  return await response.json();
};

export const updateProjectDetails = async (
  database: string,
  projectId: string,
  updates: Partial<ProjectDetails>
): Promise<ProjectDetails> => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const url = new URL(`/api/projects/${projectId}`, window.location.origin);
  url.searchParams.append("database", database);

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update project details");
  }

  return await response.json();
};

export const fetchCallDetails = async (
  database: string,
  callId: string
): Promise<CallDetails> => {
  const response = await fetch(`/api/calls/${callId}?database=${database}`);
  if (!response.ok) {
    throw new Error("Failed to fetch call details");
  }
  return await response.json();
};

export const fetchAgentDetails = async (database: string, id: string) => {
  const url = new URL(`/api/agents/${id}`, window.location.origin);
  url.searchParams.append("database", database);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch agent details");
  }
  return await response.json();
};

export const uploadCallData = async (
  database: string,
  callData: Partial<CallDetails>
): Promise<{ message: string; id: string }> => {
  const url = new URL(`/api/calls`, window.location.origin);
  url.searchParams.append("database", database);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ callData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload call data");
  }

  return await response.json();
};
