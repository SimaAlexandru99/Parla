'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchAgentDetails } from '@/lib/apiClient';
import { AgentDetails } from '@/types/PropsTypes';
import AgentDetailsClient from '../client/AgentClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentDetailsWrapper() {
    const params = useParams();
    const id = params?.id as string;
    const { companyData } = useFetchUserCompanyDatabase();
    const [agent, setAgent] = useState<AgentDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAgentDetails() {
            if (id && companyData?.database) {
                try {
                    const agentData = await fetchAgentDetails(companyData.database, id);
                    setAgent(agentData);
                } catch (err) {
                    console.error('Failed to fetch agent details:', err);
                    setError('Failed to load agent details. Please try again later.');
                }
            }
        }

        loadAgentDetails();
    }, [id, companyData?.database]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!agent) {
        return (
            <div className="flex justify-center w-full">
                <div className='flex flex-1 flex-col h-screen gap-4 p-4 md:gap-8 md:p-6 w-full md:w-4/5 lg:w-3/5'>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    return <AgentDetailsClient initialAgent={agent} />;
}
