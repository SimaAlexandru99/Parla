'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCcw, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchProjects } from '@/lib/apiClient';
import CustomPagination from '@/components/common/pagination';
import { ProjectDetails } from '@/types/PropsTypes';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [projects, setProjects] = useState<ProjectDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const limitPerPage = 10;
    const router = useRouter();

    const handleViewProjectDetails = (projectId: string) => {
        router.push(`/next-mind/projects/${projectId}`);
    };


    const fetchProjectsData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            if (companyData?.database) {
                const data = await fetchProjects(companyData.database, page, limitPerPage, searchTerm);
                setProjects(data.projects);
                setTotalProjects(data.totalProjects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
            toast({
                title: "Error",
                description: "Failed to fetch projects. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [limitPerPage, companyData?.database, searchTerm, toast]);

    useEffect(() => {
        if (companyData?.database) {
            fetchProjectsData(page);
        }
    }, [fetchProjectsData, page, companyData?.database]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    return (
        <main className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6'>
            <div className="w-full">
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">
                                {t.projectsPage.title}
                            </CardTitle>
                            <CardDescription>
                                {t.projectsPage.description}
                            </CardDescription>
                        </div>
                        <div className='flex items-center justify-between mb-4'>
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={t.projectsPage.searchPlaceholder}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="pl-10 pr-4 py-2 w-full "
                                />
                            </div>
                            <Button
                                onClick={() => fetchProjectsData(page)}
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
                                        <TableHead className="text-center">{t.projectsPage.tableColumnName}</TableHead>
                                        <TableHead className="text-center">{t.projectsPage.tableColumnAgentsCount}</TableHead>
                                        <TableHead className="text-center">{t.projectsPage.tableColumnActions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: limitPerPage }).map((_, index) => (
                                            <TableRow key={index}>
                                                {Array.from({ length: 3 }).map((_, cellIndex) => (
                                                    <TableCell key={cellIndex} className="text-center">
                                                        <Skeleton className="h-8 w-full" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : projects.length > 0 ? (
                                        projects.map((project) => (
                                            <TableRow key={project._id}>
                                                <TableCell className="text-center">{project.project_name}</TableCell>
                                                <TableCell className="text-center">{project.agentsCount}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => handleViewProjectDetails(project._id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4">
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
            <CustomPagination
                page={page}
                totalItems={totalProjects}
                itemsPerPage={limitPerPage}
                onPageChange={handlePageChange}
            />
        </main>
    );
}