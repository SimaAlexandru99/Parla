'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentDetails } from '@/types/PropsTypes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonRow = () => (
    <TableRow>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-24 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-28 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-20 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-8 w-8 mx-auto" />
        </TableCell>
    </TableRow>
);

interface AgentsTableProps {
    agents: AgentDetails[];
    loading: boolean;
    handleViewDetails: (agent: AgentDetails) => void;
    t: any;
}

function AgentsTable({ agents, loading, handleViewDetails, t }: AgentsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t.agentsPage.tableColumnName}</TableHead>
                    <TableHead>{t.agentsPage.tableColumnUsername}</TableHead>
                    <TableHead>{t.agentsPage.tableColumnProject}</TableHead>
                    <TableHead className="text-right">{t.agentsPage.tableColumnActions}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <SkeletonRow key={index} />
                    ))
                ) : agents.length > 0 ? (
                    agents.map((agent) => (
                        <TableRow key={agent._id}>
                            <TableCell>{`${agent.first_name} ${agent.last_name}`}</TableCell>
                            <TableCell>{agent.username}</TableCell>
                            <TableCell>{agent.project}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    onClick={() => {
                                        console.log('Navigating to agent ID:', agent._id); // Debugging log
                                        handleViewDetails(agent);
                                    }}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                            {t.common.noDataAvailable}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

export default AgentsTable;
