'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectDetails } from '@/types/PropsTypes';
import { fetchProjectDetails } from '@/lib/apiClient'; // We'll create this function
import { Skeleton } from '@/components/ui/skeleton';
import useFetchUserCompanyDatabase from '@/hooks/useFetchUserCompanyDatabase';

export default function ProjectDetailsPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const { companyData } = useFetchUserCompanyDatabase();
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProjectDetails = async () => {
            if (id && companyData?.database) {
                try {
                    const projectData = await fetchProjectDetails(companyData.database, id);
                    setProject(projectData);
                } catch (error) {
                    console.error('Failed to fetch project details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadProjectDetails();
    }, [id, companyData?.database]);

    if (loading) {
        return <Skeleton className="w-full h-[400px]" />;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    return (
        <Card className=''>
            <CardHeader>
                <CardTitle>{project.project_name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold">Greetings Words</h3>
                        <p>{project.greetings_words.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Companies Names</h3>
                        <p>{project.companies_names.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Availability Words</h3>
                        <p>{project.availability_words.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">From What Company</h3>
                        <p>{project.from_what_company.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Positive Words</h3>
                        <p>{project.positive_words.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Negative Words</h3>
                        <p>{project.negative_words.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Common Words</h3>
                        <p>{project.common_words.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Words to Remove</h3>
                        <p>{project.words_to_remove.join(', ')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Analysis Settings</h3>
                        <ul>
                            <li>Agent Presented: {project.analyze_agent_presented ? 'Yes' : 'No'}</li>
                            <li>Company Presented: {project.analyze_company_presented ? 'Yes' : 'No'}</li>
                            <li>Client Availability: {project.analyze_client_availability ? 'Yes' : 'No'}</li>
                            <li>From What Company: {project.analyze_from_what_company ? 'Yes' : 'No'}</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">Agents Count</h3>
                        <p>{project.agentsCount}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}