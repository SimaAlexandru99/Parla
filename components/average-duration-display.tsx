// components/common/AverageDurationDisplay.tsx
import React, { useEffect, useState } from 'react';
import { fetchAverageAudioDurationByDateRange } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

interface AverageDurationDisplayProps {
    database: string;
    startDate: Date | null;
    endDate: Date | null;
}

const AverageDurationDisplay = ({ database, startDate, endDate }: AverageDurationDisplayProps) => {
    const [averageDuration, setAverageDuration] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchAverageAudioDurationByDateRange(database, startDate, endDate);
                setAverageDuration(data.averageDurationText);
            } catch (error) {
                console.error('Failed to fetch average duration data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [database, startDate, endDate]);

    return (
        <Card className=''>
            <CardHeader className="p-6 flex">
                {loading ? (
                    <Skeleton className="h-6 w-1/3" />
                ) : (
                    <CardTitle className="font-semibold leading-none tracking-tight">
                        {averageDuration !== null ? averageDuration : 'No data available'}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent className="flex">
                {loading ? (
                    <Skeleton className="h-4 w-1/2" />
                ) : (
                    <p className="text-center">{t.averageDurationDisplay.title}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AverageDurationDisplay;
