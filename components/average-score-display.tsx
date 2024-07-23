// components/common/AverageScoreChart.tsx
import React, { useEffect, useState } from 'react';
import { fetchScores } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

interface AverageScoreChartProps {
    database: string;
    startDate: Date | null;
    endDate: Date | null;
}

const AverageScoreChart = ({ database, startDate, endDate }: AverageScoreChartProps) => {
    const [averageScore, setAverageScore] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const scores = await fetchScores(database, startDate, endDate);
                const totalScore = scores.reduce((acc, score) => acc + score, 0);
                const avgScore = scores.length ? (totalScore / scores.length).toFixed(2) : null;
                setAverageScore(avgScore);
            } catch (error) {
                console.error('Failed to fetch scores:', error);
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
                        {averageScore !== null ? averageScore : 'No data available'}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent className="flex">
                {loading ? (
                    <Skeleton className="h-4 w-1/2" />
                ) : (
                    <p className="text-center">{t.averageScoreDisplay.title}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AverageScoreChart;
