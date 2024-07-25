'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
    fetchMonthlyData,
    fetchRecordingCounts,
    fetchAverageAudioDuration,
    fetchAverageScore,
    fetchAverageProcessingTime,
    fetchLatestCalls,
    fetchCountByDateRange,
    fetchAverageAudioDurationByDateRange,
    fetchScores,
    fetchAverageSentimentByDateRange,
    fetchCallDurationData
} from '@/lib/apiClient';
import DateRangeSelector from '@/components/date-range-selector';
import CountDisplay from '@/components/count-display';
import AverageDurationDisplay from '@/components/AverageDurationDisplay';
import MonthlyBarChart from '@/components/monthly-bar-chart';
import AverageScoreChart from '@/components/average-score-display';
import AverageSentimentDisplay from '@/components/average-sentiment-display';
import CallDurationDistribution from '@/components/calls/call/call-duration-distribution';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from "@/contexts/LanguageContext";

interface MonthlyData {
    month: number;
    count: number;
}

export default function AnalyticsPage() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const { companyData } = useFetchUserCompanyDatabase();

    const fetchData = useCallback(async (startDate: Date | null, endDate: Date | null) => {
        setLoading(true);
        try {
            if (!companyData?.database) return;

            const [recordingCounts, averageAudioDuration, averageScore, averageProcessingTime, monthlyData] = await Promise.all([
                fetchRecordingCounts(companyData.database),
                fetchAverageAudioDuration(companyData.database),
                fetchAverageScore(companyData.database),
                fetchAverageProcessingTime(companyData.database),
                fetchMonthlyData(companyData.database, startDate || new Date(), endDate || new Date())
            ]);

            const filledData: MonthlyData[] = [];
            const start = new Date(startDate || new Date());
            const end = new Date(endDate || new Date());

            for (let date = start; date <= end; date.setMonth(date.getMonth() + 1)) {
                const monthIndex = date.getMonth();
                filledData.push({
                    month: monthIndex + 1,
                    count: monthlyData.find(d => d._id.month === monthIndex + 1)?.count || 0,
                });
            }

            setMonthlyData(filledData);
        } catch (error) {
            console.error("Failed to fetch monthly data:", error);
        } finally {
            setLoading(false);
        }
    }, [companyData]);

    useEffect(() => {
        fetchData(startDate, endDate);
    }, [fetchData, startDate, endDate]);

    const handleApplyFilters = (period: string, startDate: Date | null, endDate: Date | null) => {
        setStartDate(startDate);
        setEndDate(endDate);
    };

    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <div className="w-full">
                <Card className="w-full bg-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">{t.analyticsPage.title}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">{t.analyticsPage.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="lg:grid-cols-4 gap-4">
                        <div className="mb-4">
                            <DateRangeSelector onApply={handleApplyFilters} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-3">
                                <MonthlyBarChart
                                    loading={loading}
                                    monthlyData={monthlyData}
                                />
                            </div>
                            <div className="flex flex-col gap-4 w-full lg:col-span-1">
                                {companyData?.database && (
                                    <>
                                        <CountDisplay
                                            database={companyData.database}
                                            startDate={startDate}
                                            endDate={endDate}
                                        />
                                        <AverageDurationDisplay
                                            database={companyData.database}
                                            startDate={startDate}
                                            endDate={endDate}
                                        />
                                        <AverageScoreChart
                                            database={companyData.database}
                                            startDate={startDate}
                                            endDate={endDate}
                                        />
                                        <AverageSentimentDisplay
                                            database={companyData.database}
                                            startDate={startDate}
                                            endDate={endDate}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
