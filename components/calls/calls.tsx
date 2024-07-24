'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCcw, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { CallDetails } from '@/types/PropsTypes';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCalls, deleteCall } from '@/lib/apiClient';
import CustomPagination from '@/components/pagination';
import CallsTable from '@/components/calls/calls-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function Calls() {
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [calls, setCalls] = useState<CallDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCalls, setTotalCalls] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { theme } = useTheme();
    const { toast } = useToast();
    const router = useRouter();
    const limitPerPage = 10;

    const fetchCallsData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            if (companyData?.database) {
                const data = await fetchCalls(companyData.database, page, limitPerPage, searchTerm);
                setCalls(Array.isArray(data.calls) ? data.calls : []);
                setTotalCalls(data.totalCalls || 0);
            }
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
    }, [limitPerPage, companyData?.database, searchTerm, toast]);

    useEffect(() => {
        if (companyData?.database) {
            fetchCallsData(page);
        }
    }, [fetchCallsData, page, companyData?.database]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const ringColor = useMemo(() => (theme === 'dark' ? '#ffffff' : '#000000'), [theme]);
    const textColor = useMemo(() => (theme === 'dark' ? '#ffffff' : '#000000'), [theme]);
    const trailColor = useMemo(() => (theme === 'dark' ? '#333333' : '#d6d6d6'), [theme]);

    const formatDuration = useCallback((seconds: number): string => {
        const roundedSeconds = Math.round(seconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const remainingSeconds = roundedSeconds % 60;
        return `${minutes}m ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}s`;
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!companyData?.database) return;

        try {
            await deleteCall(companyData.database, id);
            fetchCallsData(page);
            toast({
                title: "Success",
                description: "Call deleted successfully.",
            });
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

    const renderStatus = useCallback((status: string): React.ReactNode => {
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

    return (
        <Card className="w-full bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">{t.dashboard.conversations}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t.dashboard.recentConversations}</CardDescription>
                </div>
                <div className='flex items-center justify-between mb-4'>
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={t.callsPage.searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 w-full"
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
                    <CallsTable
                        calls={calls}
                        loading={loading}
                        handleViewDetails={handleViewDetails}
                        handleDelete={handleDelete}
                        ringColor={ringColor}
                        textColor={textColor}
                        trailColor={trailColor}
                        formatDuration={formatDuration}
                        renderStatus={renderStatus}
                        t={t}
                    />
                </div>
                {!loading && calls.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">{t.common.noDataAvailable}</p>
                )}
                <CustomPagination
                    page={page}
                    totalItems={totalCalls}
                    itemsPerPage={limitPerPage}
                    onPageChange={handlePageChange}
                />
            </CardContent>
        </Card>
    );
}