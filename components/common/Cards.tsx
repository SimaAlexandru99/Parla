import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataCardProps, SkeletonCardProps } from '@/types/PropsTypes';

export const DataCard = ({ icon, title, value, change, loading }: DataCardProps) => {
    return loading ? (
        <Skeleton className="rounded-xl h-24 w-full" />
    ) : (
        <Card className="transition-colors duration-300 ease-in-out hover:bg-primary hover:text-primary-foreground group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium group-hover:text-primary-foreground">{title}</CardTitle>
                <div className="group-hover:text-primary-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold group-hover:text-primary-foreground">
                    {typeof value === 'number' ? value.toLocaleString('ro-RO') : value}
                </div>
                {change && (
                    <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">
                        {change}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export const SkeletonCard = ({ className = "" }: SkeletonCardProps) => (
    <Card className={`${className} animate-pulse`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </CardContent>
    </Card>
);

export const SkeletonBarChart = () => (
    <div className="animate-pulse">
        <Skeleton className="h-[450px] w-full" />
        <div className="flex justify-between mt-2">
            {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-8" />
            ))}
        </div>
    </div>
);

export const SkeletonCallEntry = () => (
    <div className="flex items-center gap-4 pt-4 pb-4 animate-pulse">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="grid gap-1 flex-grow">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
    </div>
);
