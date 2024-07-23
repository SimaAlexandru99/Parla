// components/common/AverageSentimentDisplay.tsx
import React, { useEffect, useState } from 'react';
import { fetchAverageSentimentByDateRange } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

interface AverageSentimentDisplayProps {
    database: string;
    startDate: Date | null;
    endDate: Date | null;
}

const AverageSentimentDisplay = ({ database, startDate, endDate }: AverageSentimentDisplayProps) => {
    const [averageSentiment, setAverageSentiment] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchAverageSentimentByDateRange(database, startDate, endDate);
                setAverageSentiment(data.averageSentiment);
            } catch (error) {
                console.error('Failed to fetch average sentiment data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [database, startDate, endDate]);

    return (
        <Card className=''>
            <CardHeader className="p-6">
                {loading ? (
                    <Skeleton className="h-6 w-1/3" />
                ) : (
                    <CardTitle className="font-semibold leading-none tracking-tight">
                        {averageSentiment !== null ? averageSentiment.toFixed(2) : 'No data available'}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent className="flex">
                {loading ? (
                    <Skeleton className="h-4 w-1/2" />
                ) : (
                    <p className="text-center">{t.averageSentimentDisplay.title}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AverageSentimentDisplay;
