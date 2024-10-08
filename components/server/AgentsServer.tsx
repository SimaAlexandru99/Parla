'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentDetails } from '@/types/PropsTypes';
import { useLanguage } from "@/contexts/client/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchAgents } from '@/lib/apiClient';
import CustomPagination from '@/components/CustomPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import AgentsTable from '@/components/client/AgentsTable';

export default function Agents() {
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [agents, setAgents] = useState<AgentDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalAgents, setTotalAgents] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const limitPerPage = 10;

    const fetchAgentsData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            if (companyData?.database) {
                const data = await fetchAgents(companyData.database, page, limitPerPage, searchTerm);
                setAgents(Array.isArray(data.agents) ? data.agents : []);
                setTotalAgents(data.totalAgents || 0);
                console.log('Fetched agents:', data.agents); // Debugging log
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            setAgents([]);
            toast({
                title: "Error",
                description: "Failed to fetch agents. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [limitPerPage, companyData?.database, searchTerm, toast]);

    useEffect(() => {
        if (companyData?.database) {
            fetchAgentsData(page);
        }
    }, [fetchAgentsData, page, companyData?.database]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const handleViewDetails = (agent: AgentDetails) => {
        console.log('Navigating to agent ID:', agent._id); // Debugging log
        router.push(`/agents/${agent._id}`);
    };

    return (
        <Card className="w-full bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">{t.agentsPage.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t.agentsPage.description}</CardDescription>
                </div>
                <div className='flex items-center justify-between mb-4'>
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={t.agentsPage.searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 w-full"
                        />
                    </div>
                    <Button
                        onClick={() => fetchAgentsData(page)}
                        disabled={loading}
                        className="ml-4 bg-accent hover:bg-accent/80"
                        size="icon"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <AgentsTable
                        agents={agents}
                        loading={loading}
                        handleViewDetails={handleViewDetails}
                        t={t}
                    />
                </div>
                <CustomPagination
                    page={page}
                    totalItems={totalAgents}
                    itemsPerPage={limitPerPage}
                    onPageChange={handlePageChange}
                />
            </CardContent>
        </Card>
    );
}
