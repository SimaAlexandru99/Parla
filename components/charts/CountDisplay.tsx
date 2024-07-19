// components/common/CountDisplay.tsx
import React, { useEffect, useState } from 'react';
import { fetchCountByDateRange } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

interface CountDisplayProps {
    database: string;
    startDate: Date | null;
    endDate: Date | null;
}

const CountDisplay = ({ database, startDate, endDate }: CountDisplayProps) => {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const count = await fetchCountByDateRange(database, startDate, endDate);
                setCount(count);
            } catch (error) {
                console.error('Failed to fetch count data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (database) {
            fetchData();
        }
    }, [database, startDate, endDate]);

    return (
        <Card className=' h-full'>
            <CardHeader className="p-6">
                {loading ? (
                    <Skeleton className="h-6 w-1/3" />
                ) : (
                    <CardTitle className="font-semibold leading-none tracking-tight">
                        {count !== null ? count : 'No data available'}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-4 w-1/2" />
                ) : (
                    <p>{t.countDisplay.title}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default CountDisplay;
