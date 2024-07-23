import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Phone, Clock, Award, Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import { Bar, BarChart, XAxis, CartesianGrid } from 'recharts';
import {
    checkMongoConnection,
    fetchRecordingCounts,
    fetchAverageAudioDuration,
    fetchAverageScore,
    fetchAverageProcessingTime,
    fetchMonthlyData,
    fetchLatestCalls
} from '@/lib/apiClient';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CallDetails } from '@/types/PropsTypes';
import { getRingColor } from '@/lib/colorUtils';
import { useLanguage } from "@/contexts/LanguageContext";
import { ChartContainer, ChartTooltipContent, ChartConfig, ChartTooltip } from "@/components/ui/chart";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { DataCard, SkeletonCard, SkeletonBarChart, SkeletonCallEntry } from '@/components/cards';
import { useRouter } from 'next/navigation';


interface MonthlyData {
    month: number;
    count: number;
}

const monthNamesInRomanian = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sept", "Oct", "Noi", "Dec"];

const getFirstDayOfCurrentYear = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
};

const getLastDayOfCurrentYear = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), 11, 31);
};

const OverviewTab = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [, setConnectionStatus] = useState('Checking connection...');
    const [recordingCount, setRecordingCount] = useState<number | null>(null);
    const [percentageChange, setPercentageChange] = useState<string | null>(null);
    const [averageAudioDuration, setAverageAudioDuration] = useState<string | null>(null);
    const [averageScore, setAverageScore] = useState<number | null>(null);
    const [audioDurationChange, setAudioDurationChange] = useState<string | null>(null);
    const [averageScoreChange, setAverageScoreChange] = useState<string | null>(null);
    const [averageProcessingTime, setAverageProcessingTime] = useState<string | null>(null);
    const [processingTimeChange, setProcessingTimeChange] = useState<string | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [latestCalls, setLatestCalls] = useState<CallDetails[]>([]);
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [calls, setCalls] = useState<CallDetails[]>([]);
    const [totalCalls, setTotalCalls] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const router = useRouter();



    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "hsl(var(--accent))",
        },
    } satisfies ChartConfig;

    const handleConnectionError = useCallback((error: unknown) => {
        if (error instanceof Error) {
            setConnectionStatus(`${t.overviewTab.handleConnectionError} ${error.message}`);
        } else {
            setConnectionStatus(`${t.overviewTab.handleConnectionUnknownError}`);
        }
    }, [setConnectionStatus, t.overviewTab.handleConnectionError, t.overviewTab.handleConnectionUnknownError]);

    const calculatePercentageChange = useCallback((currentCount: number, lastMonthCount: number) => {
        if (lastMonthCount > 0) {
            const change = ((currentCount - lastMonthCount) / lastMonthCount) * 100;
            setPercentageChange(`${change.toFixed(2)}% ${change >= 0 ? 'mai multe' : 'mai puține'} procesate`);
        } else {
            setPercentageChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [setPercentageChange, t.overviewTab.handleInfoNotExist]);

    const calculateAudioDurationChange = useCallback((currentDuration: number, lastDuration: number) => {
        if (lastDuration > 0) {
            const change = ((currentDuration - lastDuration) / lastDuration) * 100;
            setAudioDurationChange(`${change.toFixed(2)}% ${change >= 0 ? 'mai mare' : 'mai mic'}`);
        } else {
            setAudioDurationChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [setAudioDurationChange, t.overviewTab.handleInfoNotExist]);

    const calculateAverageScoreChange = useCallback((currentScore: number, lastScore: number) => {
        if (lastScore > 0) {
            const change = ((currentScore - lastScore) / lastScore) * 100;
            setAverageScoreChange(`${change.toFixed(2)}% ${change >= 0 ? 'mai mare' : 'mai mic'}`);
        } else {
            setAverageScoreChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [setAverageScoreChange, t.overviewTab.handleInfoNotExist]);

    const calculateProcessingTimeChange = useCallback((currentTime: number, lastTime: number) => {
        if (lastTime > 0) {
            const change = ((currentTime - lastTime) / lastTime) * 100;
            setProcessingTimeChange(`${change.toFixed(2)}% ${change >= 0 ? 'mai mare' : 'mai mic'}`);
        } else {
            setProcessingTimeChange(`${t.overviewTab.handleInfoNotExist}`);
        }
    }, [setProcessingTimeChange, t.overviewTab.handleInfoNotExist]);

    const refetchData = useCallback(async () => {
        if (!companyData?.database) return;

        const startDate = getFirstDayOfCurrentYear();
        const endDate = getLastDayOfCurrentYear();

        try {
            const mongoConnection = await checkMongoConnection();
            setConnectionStatus(mongoConnection.status);

            if (mongoConnection.status === 'Connected to MongoDB') {
                const [
                    recordingCounts,
                    averageAudioDuration,
                    averageScore,
                    averageProcessingTime,
                    monthlyData,
                    latestCallsResponse
                ] = await Promise.all([
                    fetchRecordingCounts(companyData.database),
                    fetchAverageAudioDuration(companyData.database),
                    fetchAverageScore(companyData.database),
                    fetchAverageProcessingTime(companyData.database),
                    fetchMonthlyData(companyData.database, startDate, endDate), // Use dynamic dates
                    fetchLatestCalls(companyData.database, page, 5)
                ]);

                setRecordingCount(recordingCounts.currentMonthCount);
                calculatePercentageChange(recordingCounts.currentMonthCount, recordingCounts.lastMonthCount);

                setAverageAudioDuration(averageAudioDuration.averageDurationText);
                calculateAudioDurationChange(averageAudioDuration.averageDurationInSecondsCurrentMonth, averageAudioDuration.averageDurationInSecondsLastMonth);

                setAverageScore(averageScore.averageScoreCurrentMonth);
                calculateAverageScoreChange(averageScore.averageScoreCurrentMonth, averageScore.averageScoreLastMonth);

                setAverageProcessingTime(averageProcessingTime.averageProcessingTimeText);
                calculateProcessingTimeChange(averageProcessingTime.averageProcessingTimeInSecondsCurrentMonth, averageProcessingTime.averageProcessingTimeInSecondsLastMonth);

                const filledData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    count: 0,
                }));

                monthlyData.forEach((item) => {
                    const monthIndex = item._id.month - 1; // Adjusted for 0-based index
                    filledData[monthIndex] = {
                        month: item._id.month,
                        count: item.count,
                    };
                });

                setMonthlyData(filledData);
                setLatestCalls(latestCallsResponse.latestCalls);
                setTotalCalls(latestCallsResponse.totalCalls);
                setLoading(false);
            }
        } catch (error) {
            handleConnectionError(error);
        }
    }, [companyData?.database, calculateAudioDurationChange, calculateAverageScoreChange, calculatePercentageChange, calculateProcessingTimeChange, handleConnectionError, page]);

    useEffect(() => {
        if (companyData) {
            refetchData();
        }
    }, [companyData, refetchData]);

    const cardsData = useMemo(() => [
        {
            icon: <Phone className="h-4 w-4" />,
            title: t.dashboard.totalCalls,
            value: recordingCount,
            change: percentageChange,
            loading
        },
        {
            icon: <Clock className="h-4 w-4" />,
            title: t.dashboard.averageTime,
            value: averageAudioDuration,
            change: audioDurationChange,
            loading
        },
        {
            icon: <Award className="h-4 w-4" />,
            title: t.dashboard.score,
            value: averageScore !== null ? `${averageScore} %` : null,
            change: averageScoreChange,
            loading
        },
        {
            icon: <Timer className="h-4 w-4" />,
            title: t.dashboard.processingTime,
            value: averageProcessingTime,
            change: processingTimeChange,
            loading
        },
    ], [t.dashboard.totalCalls, t.dashboard.averageTime, t.dashboard.score, t.dashboard.processingTime, recordingCount, percentageChange, loading, averageAudioDuration, audioDurationChange, averageScore, averageScoreChange, averageProcessingTime, processingTimeChange]);


    const handleViewDetails = useCallback((call: CallDetails) => {
        router.push(`/next-mind/calls/${call._id}`);
    }, [router]);

    return (
        <Card className="w-full bg-transparent border-none p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-0">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-light">{t.overviewTab.titlePresentation}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="lg:grid-cols-4 gap-4 p-0">
                <div className="grid gap-4 md:grid-cols-2 mb-4 md:gap-6 lg:grid-cols-4">
                    {loading
                        ? cardsData.map((_, index) => (
                            <SkeletonCard key={index} className="" />
                        ))
                        : cardsData.map((card, index) => (
                            <div key={index} className="transform transition-all duration-300 ease-in-out hover:scale-105">
                                <DataCard
                                    icon={card.icon}
                                    title={card.title}
                                    value={card.value}
                                    change={card.change}
                                    loading={card.loading}
                                />
                            </div>
                        ))
                    }
                </div>
                <div className="grid gap-4 mt-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    {loading ? (
                        <>
                            <Card className="xl:col-span-2 ">
                                <CardHeader className="p-6">
                                    <Skeleton className="h-6 w-1/3" />
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <SkeletonBarChart />
                                </CardContent>
                            </Card>
                            <Card className="">
                                <CardHeader>
                                    <Skeleton className="h-6 w-1/2" />
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {[...Array(5)].map((_, index) => (
                                        <SkeletonCallEntry key={index} />
                                    ))}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card className=" xl:col-span-2" x-chunk="dashboard-01-chunk-4">
                                <CardHeader className="p-6">
                                    <CardTitle className="font-semibold leading-none tracking-tight">{t.overviewTab.titlePresentation}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig}>
                                        <BarChart accessibilityLayer data={monthlyData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value) => monthNamesInRomanian[value - 1]}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent hideLabel />}
                                            />
                                            <Bar dataKey="count" fill="var(--color-desktop)" radius={8} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            <Card className="bg-transparent" x-chunk="dashboard-01-chunk-5">
                                <CardHeader>
                                    <CardTitle>{t.overviewTab.titleRecentCalls}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {latestCalls.map((call, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-4 rounded-md cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent hover:text-primary-foreground hover:shadow-md group"
                                            onClick={() => handleViewDetails(call)}
                                        >
                                            <Avatar className="h-9 w-9 transition-colors duration-300 ease-in-out">
                                                <AvatarFallback className=" transition-colors duration-300 ease-in-out group-hover:bg-primary-foreground group-hover:text-primary">
                                                    {call.agent_info.first_name[0]}{call.agent_info.last_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-1 flex-grow">
                                                <span className="text-sm font-medium leading-none transition-colors duration-300 ease-in-out group-hover:text-primary-foreground">
                                                    {call.agent_info.first_name} {call.agent_info.last_name}
                                                </span>
                                                <span className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out group-hover:text-primary-foreground/80">
                                                    {call.day_processed ? new Date(call.day_processed).toLocaleDateString() : 'Date not available'}
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 transition-all duration-300 ease-in-out group-hover:scale-110">
                                                <CircularProgressbar
                                                    value={call.score}
                                                    maxValue={100}
                                                    text={`${call.score}`}
                                                    styles={buildStyles({
                                                        pathColor: getRingColor(call.score),
                                                        textColor: 'currentColor',
                                                        trailColor: 'var(--accent)',
                                                        textSize: '28px',
                                                        pathTransition: 'stroke-dashoffset 0.5s ease 0s',
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default OverviewTab;
