// components/dashboard/Agent/AgentActivityTab.tsx
import React from 'react';
import { AgentDetails, CallDetails } from '@/types/PropsTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CallsTable from '@/components/dashboard/Call/CallsTable';

interface AgentActivityTabProps {
    agentDetails: AgentDetails | null;
    calls: CallDetails[];
    callsLoading: boolean;
    handleViewCallDetails: (call: CallDetails) => void;
    handleDelete: (id: string) => void;
    handleViewAgentDetails: (agentDetails: any) => void;
    formatDuration: (seconds: number) => string;
    renderStatus: (status: string) => React.ReactNode;
    t: any;
    theme: string;
    companyData: string;
}

const AgentActivityTab = ({
    agentDetails,
    calls,
    callsLoading,
    handleViewCallDetails,
    handleDelete,
    handleViewAgentDetails,
    formatDuration,
    renderStatus,
    t,
    theme,
    companyData
}: AgentActivityTabProps) => {
    if (!agentDetails) return null;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">{t.agent_page.activity.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t.agent_page.activity.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="lg:grid-cols-4 gap-4">
                <CallsTable
                    calls={calls}
                    loading={callsLoading}
                    handleViewDetails={handleViewCallDetails}
                    handleDelete={handleDelete}
                    handleViewAgentDetails={handleViewAgentDetails}
                    ringColor={theme === 'dark' ? '#ffffff' : '#000000'}
                    textColor={theme === 'dark' ? '#ffffff' : '#000000'}
                    trailColor={theme === 'dark' ? '#333333' : '#d6d6d6'}
                    formatDuration={formatDuration}
                    renderStatus={renderStatus}
                    t={t}
                    agentUsername={agentDetails.username}
                    companyDatabase={companyData}
                />
            </CardContent>
        </Card>
    );
};

export default AgentActivityTab;
