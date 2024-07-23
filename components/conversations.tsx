'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowUpRight, Eye, Trash, Search, RefreshCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from 'next-themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import { CallDetails } from '@/types/PropsTypes';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCalls, deleteCall } from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';


const ConversationsTab = () => {
    const [calls, setCalls] = useState<CallDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCall, setSelectedCall] = useState<CallDetails | null>(null);
    const [page, setPage] = useState(1);
    const [totalCalls, setTotalCalls] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const { toast } = useToast();
    const router = useRouter();
    const limitPerPage = 10;

    const fetchCallsData = useCallback(async (page: number) => {
        if (!companyData?.database) return;

        setLoading(true);
        try {
            const data = await fetchCalls(companyData.database, page, limitPerPage, searchTerm);
            setCalls(Array.isArray(data.calls) ? data.calls : []);
            setTotalCalls(data.totalCalls || 0);
        } catch (error) {
            console.error('Error fetching calls:', error);
            setCalls([]);
            toast({
                title: "Error",
                description: "Failed to fetch calls. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [companyData?.database, limitPerPage, searchTerm, toast]);

    useEffect(() => {
        fetchCallsData(page);
    }, [fetchCallsData, page]);

    const ringColor = useMemo(() => (theme === 'dark' ? '#ffffff' : '#000000'), [theme]);
    const textColor = useMemo(() => (theme === 'dark' ? '#ffffff' : '#000000'), [theme]);
    const trailColor = theme === 'dark' ? '#333333' : '#d6d6d6';

    const formatDuration = useCallback((seconds: number) => {
        const roundedSeconds = Math.round(seconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const remainingSeconds = roundedSeconds % 60;
        return `${minutes}m ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}s`;
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!companyData?.database) return;

        try {
            await deleteCall(companyData.database, id);
            toast({
                title: "Success",
                description: "Call deleted successfully.",
            });
            fetchCallsData(page);
        } catch (error) {
            console.error('Error deleting call:', error);
            toast({
                title: "Error",
                description: "Failed to delete call. Please try again.",
                variant: "destructive",
            });
        }
    }, [companyData?.database, fetchCallsData, page, toast]);

    const handleViewDetails = (call: CallDetails) => {
        router.push(`/next-mind/calls/${call._id}`);
    };


    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const renderStatus = useCallback((status: string) => {
        let statusClass = '';
        let statusText = '';

        switch (status) {
            case 'processed':
                statusClass = 'bg-green-100 text-green-700';
                statusText = t.conversationsTab.statusLabels.done;
                break;
            case 'processing':
                statusClass = 'bg-yellow-100 text-yellow-700';
                statusText = t.conversationsTab.statusLabels.processing;
                break;
            case 'new':
                statusClass = 'bg-blue-100 text-blue-700';
                statusText = t.conversationsTab.statusLabels.new;
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-700';
                statusText = status;
                break;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
                {statusText}
            </span>
        );
    }, [t.conversationsTab.statusLabels]);

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

    return (
        <div className="w-full space-y-4">
            <Card className="w-full bg-background">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>{t.dashboard.conversations}</CardTitle>
                        <CardDescription>{t.dashboard.recentConversations}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t.common.search}
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-8 pr-4 py-2 w-full max-w-xs"
                            />
                        </div>
                        <Button
                            onClick={() => fetchCallsData(page)}
                            disabled={loading}
                            className="ml-4"
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
                                    Array.from({ length: limitPerPage }).map((_, index) => (
                                        <SkeletonRow key={index} />
                                    ))
                                ) : calls.length > 0 ? (
                                    calls.map((call, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                                <Link href={`/agents/${call.agent_info.username}`}>
                                                    {`${call.agent_info.first_name} ${call.agent_info.last_name}`}
                                                </Link>
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
                                                            backgroundColor: theme === 'dark' ? '#3e98c7' : '#f0f0f0',
                                                        })}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">{formatDuration(call.file_info.duration)}</TableCell>
                                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                                <Link href={`/project/${call.agent_info.project}`}>
                                                    {call.agent_info.project}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">{renderStatus(call.status)}</TableCell>
                                            <TableCell className="text-center px-2 py-2 md:px-4 md:py-2">
                                                <div className="flex gap-2 justify-center">
                                                    <TooltipProvider>
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
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4">
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
    );
}

export default ConversationsTab;