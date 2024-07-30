'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProjectDetails } from '@/types/PropsTypes';
import { fetchProjectDetails, updateProjectDetails } from '@/lib/apiClient';
import { Skeleton } from '@/components/ui/skeleton';
import useFetchUserCompanyDatabase from '@/hooks/useFetchUserCompanyDatabase';
import { toast } from '@/components/ui/use-toast';

type WordCategory = keyof Pick<ProjectDetails, 'greetings_words' | 'companies_names' | 'availability_words' | 'from_what_company' | 'positive_words' | 'negative_words' | 'common_words' | 'words_to_remove'>;

export default function ProjectDetailsComponent() {
    const params = useParams();
    const id = params?.id as string;
    const { companyData } = useFetchUserCompanyDatabase();
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [newWord, setNewWord] = useState<Record<WordCategory, string>>({} as Record<WordCategory, string>);

    const loadProjectDetails = useCallback(async () => {
        if (id && companyData?.database) {
            try {
                setLoading(true);
                const projectData = await fetchProjectDetails(companyData.database, id);
                setProject(projectData);
            } catch (error) {
                console.error('Failed to fetch project details:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [id, companyData?.database]);

    useEffect(() => {
        loadProjectDetails();
    }, [loadProjectDetails]);

    const handleAddWord = async (category: WordCategory) => {
        if (!project || !newWord[category]) return;
        const updatedWords = [...project[category], newWord[category]];
        const success = await updateProject({ [category]: updatedWords });
        if (success) {
            toast({
                title: "Word Added",
                description: `Added "${newWord[category]}" to ${category.replace(/_/g, ' ')}.`,
            });
            setNewWord(prev => ({ ...prev, [category]: '' }));
        }
    };

    const handleDeleteWord = async (category: WordCategory, word: string) => {
        if (!project) return;
        const updatedWords = project[category].filter(w => w !== word);
        const success = await updateProject({ [category]: updatedWords });
        if (success) {
            toast({
                title: "Word Deleted",
                description: `Removed "${word}" from ${category.replace(/_/g, ' ')}.`,
            });
        }
    };

    const updateProject = async (updates: Partial<ProjectDetails>) => {
        if (!project || !companyData?.database || !id) {
            console.error('Missing required data for update');
            return false;
        }
        try {
            const updatedProject = await updateProjectDetails(companyData.database, id, updates);
            setProject(updatedProject);
            return true;
        } catch (error) {
            console.error('Failed to update project:', error);
            toast({
                title: "Update Failed",
                description: "Failed to update the project. Please try again.",
                variant: "destructive",
            });
            return false;
        }
    };

    if (loading) {
        return <Skeleton className="w-full h-[400px]" />;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    const renderWordList = (category: WordCategory, title: string) => (
        <div className="mb-4">
            <h3 className="font-semibold mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {project[category].map((word, index) => (
                    <div key={index} className="bg-accent text-black rounded-full px-3 py-1 text-sm flex items-center">
                        {word}
                        <button
                            onClick={() => handleDeleteWord(category, word)}
                            className="ml-2 text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex">
                <Input
                    value={newWord[category] || ''}
                    onChange={(e) => setNewWord(prev => ({ ...prev, [category]: e.target.value }))}
                    placeholder={`Add new ${title.toLowerCase()}`}
                    className="mr-2"
                />
                <Button onClick={() => handleAddWord(category)}>Add</Button>
            </div>
        </div>
    );

    return (
        <Card className='w-full max-w-4xl'>
            <CardHeader>
                <CardTitle>{project.project_name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderWordList('greetings_words', 'Greetings Words')}
                    {renderWordList('companies_names', 'Companies Names')}
                    {renderWordList('availability_words', 'Availability Words')}
                    {renderWordList('from_what_company', 'From What Company')}
                    {renderWordList('positive_words', 'Positive Words')}
                    {renderWordList('negative_words', 'Negative Words')}
                    {renderWordList('common_words', 'Common Words')}
                    {renderWordList('words_to_remove', 'Words to Remove')}
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