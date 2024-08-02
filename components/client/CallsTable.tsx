import React from 'react';
import { Eye, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { CallDetails } from '@/types/PropsTypes';

const SkeletonRow = () => (
    <TableRow>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-24 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-28 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <div className="w-12 h-12 mx-auto md:w-16 md:h-16" style={{ width: 45, height: 45 }}>
                <Skeleton className="w-full h-full rounded-full" />
            </div>
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-16 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-4 w-20 mx-auto" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <Skeleton className="h-6 w-20 mx-auto rounded-full" />
        </TableCell>
        <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
            <div className="flex gap-2 justify-center">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
        </TableCell>
    </TableRow>
);

interface CallsTableProps {
    calls: CallDetails[];
    loading: boolean;
    handleViewDetails: (call: CallDetails) => void;
    handleDelete: (id: string) => void;
    ringColor: string;
    textColor: string;
    trailColor: string;
    formatDuration: (seconds: number) => string;
    renderStatus: (status: string) => React.ReactNode;
    t: any;
    agentUsername?: string;
    companyDatabase?: string;
}

function CallsTable({
    calls,
    loading,
    handleViewDetails,
    handleDelete,
    ringColor,
    textColor,
    trailColor,
    formatDuration,
    renderStatus,
    t,
    agentUsername }: CallsTableProps) {
    const filteredCalls = agentUsername
        ? calls.filter(call => call.agent_info.username === agentUsername)
        : calls;

    return (
        <Table className="min-w-full">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnName}</TableHead>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnPhone}</TableHead>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnScore}</TableHead>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnCallDuration}</TableHead>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnProject}</TableHead>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnStatus}</TableHead>
                    <TableHead className="text-center px-2 py-2 md:px-4 md:py-2">{t.conversationsTab.tableColumnActions}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <SkeletonRow key={index} />
                    ))
                ) : (
                    filteredCalls.map((call, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                {`${call.agent_info.first_name} ${call.agent_info.last_name}`}
                            </TableCell>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">{call.phone_number}</TableCell>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                <div className="font-medium w-12 h-12 mx-auto md:w-16 md:h-16" style={{ width: 45, height: 45 }}>
                                    <CircularProgressbar
                                        value={call.score}
                                        maxValue={100}
                                        text={`${call.score}`}
                                        styles={buildStyles({
                                            pathColor: ringColor,
                                            textColor: textColor,
                                            trailColor: trailColor,
                                            backgroundColor: '#f0f0f0',
                                        })}
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">{formatDuration(call.file_info.duration)}</TableCell>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                {call.agent_info.project}
                            </TableCell>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">{renderStatus(call.status)}</TableCell>
                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                <div className="flex gap-2 justify-center">
                                    <TooltipProvider>
                                        {call.status !== 'to_process' && call.status !== 'processing' && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => handleViewDetails(call)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {t.conversationsTab.buttonDetails}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ConfirmDeleteDialog
                                                    title={t.conversationsTab.deleteConfirmTitle}
                                                    description={t.conversationsTab.deleteConfirmDescription}
                                                    onConfirm={() => handleDelete(call._id)}
                                                    trigger={
                                                        <Button size="icon" variant="destructive">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {t.conversationsTab.buttonDelete}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}

export default CallsTable;