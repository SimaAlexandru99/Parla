'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCcw, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchAgents } from '@/lib/apiClient';
import { AgentDetails } from '@/types/PropsTypes';
import CustomPagination from '@/components/common/pagination';
import AgentDetailsDrawer from '@/components/dashboard/Agent/AgentDetailsDrawer';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function AgentsPage() {
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [agents, setAgents] = useState<AgentDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AgentDetails | null>(null);
    const [page, setPage] = useState(1);
    const [totalAgents, setTotalAgents] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const limitPerPage = 10;

    const fetchAgentsData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            if (companyData?.database) {
                const data = await fetchAgents(companyData.database, page, limitPerPage, searchTerm);
                setAgents(data.agents);
                setTotalAgents(data.totalAgents);
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

    const handleViewDetails = (agent: AgentDetails) => {
        setSelectedAgent(agent);
        setDrawerOpen(true);
    };

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="w-full">
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">
                                {loading ? <Skeleton className="h-8 w-48" /> : t.agentsPage.title}
                            </CardTitle>
                            <CardDescription>
                                {loading ? <Skeleton className="h-4 w-64" /> : t.agentsPage.description}
                            </CardDescription>
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
                                className="ml-4"
                                size="icon"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />

                                    </>
                                ) : (
                                    <>
                                        <RefreshCcw className="h-4 w-4" />

                                    </>
                                )}
                            </Button>
                        </div>

                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center">{t.agentsPage.tableColumnName}</TableHead>
                                        <TableHead className="text-center">{t.agentsPage.tableColumnUsername}</TableHead>
                                        <TableHead className="text-center">{t.agentsPage.tableColumnProject}</TableHead>
                                        <TableHead className="text-center">{t.agentsPage.tableColumnActions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: limitPerPage }).map((_, index) => (
                                            <TableRow key={index}>
                                                {Array.from({ length: 4 }).map((_, cellIndex) => (
                                                    <TableCell key={cellIndex} className="text-center">
                                                        <Skeleton className="h-8 w-full" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : agents.length > 0 ? (
                                        agents.map((agent, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="text-center">
                                                    {`${agent.first_name} ${agent.last_name}`}
                                                </TableCell>
                                                <TableCell className="text-center">{agent.username}</TableCell>
                                                <TableCell className="text-center">
                                                    {agent.project}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        onClick={() => handleViewDetails(agent)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t.agentsPage.buttonDetails}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">
                                                {t.common.noDataAvailable}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CustomPagination
                page={page}
                totalItems={totalAgents}
                itemsPerPage={limitPerPage}
                onPageChange={handlePageChange}
            />
            {selectedAgent && (
                <AgentDetailsDrawer
                    isOpen={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    agentDetails={selectedAgent}
                />
            )}
        </div>
    );
}