'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCcw, Loader2, Search, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { CallDetails, ProjectDetails } from '@/types/PropsTypes';
import { useLanguage } from "@/contexts/client/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCalls, deleteCall, fetchProjects, uploadCallData } from '@/lib/apiClient';
import CustomPagination from '@/components/CustomPagination';
import CallsTable from '@/components/client/CallsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase/config';

export default function Calls() {
    const { t } = useLanguage();
    const { companyData } = useFetchUserCompanyDatabase();
    const [calls, setCalls] = useState<CallDetails[]>([]);
    const [projects, setProjects] = useState<ProjectDetails[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCalls, setTotalCalls] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { theme } = useTheme();
    const { toast } = useToast();
    const router = useRouter();
    const limitPerPage = 10;

    const fetchProjectsData = useCallback(async () => {
        try {
            if (companyData?.database) {
                const { projects } = await fetchProjects(companyData.database, 1, 100);
                if (Array.isArray(projects) && projects.every(p => '_id' in p && 'project_name' in p)) {
                    setProjects(projects);
                } else {
                    throw new Error('Invalid project data structure');
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast({
                title: "Error",
                description: "Failed to fetch projects. Please try again later.",
                variant: "destructive",
            });
        }
    }, [companyData?.database, toast]);

    const fetchCallsData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            if (companyData?.database) {
                const data = await fetchCalls(companyData.database, page, limitPerPage, searchTerm);
                setCalls(Array.isArray(data.calls) ? data.calls : []);
                setTotalCalls(data.totalCalls || 0);
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
            setCalls([]);
            toast({
                title: "Error",
                description: "Failed to fetch calls. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [limitPerPage, companyData?.database, searchTerm, toast]);

    useEffect(() => {
        if (companyData?.database) {
            fetchCallsData(page);
            fetchProjectsData();
        }
    }, [fetchCallsData, fetchProjectsData, page, companyData?.database]);

    useEffect(() => {
        if (!isDialogOpen) {
            setSelectedProject('');
            setSelectedFiles(null);
        }
    }, [isDialogOpen]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(event.target.files);
    };

    const handleUpload = async () => {
        if (!selectedFiles || !selectedProject || !companyData?.database) {
            toast({
                title: "Warning",
                description: "Please select a project and files before uploading.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        const storage = getStorage(app);

        const selectedProjectDetails = projects.find(p => p._id === selectedProject);
        if (!selectedProjectDetails) {
            toast({
                title: "Error",
                description: "Selected project not found.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
        const projectName = selectedProjectDetails.project_name;

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                console.log(`Uploading file: ${file.name}`);
                const storageRef = ref(storage, `calls/${projectName}/${file.name}`);
                await uploadBytes(storageRef, file);
                console.log(`File uploaded to Firebase: ${file.name}`);
                const downloadURL = await getDownloadURL(storageRef);
                console.log(`Download URL obtained: ${downloadURL}`);

                const filenameMatch = file.name.match(/E_(.+?)_D_/);
                let username = '';
                let firstName = '';
                let lastName = '';

                if (filenameMatch && filenameMatch[1]) {
                    username = filenameMatch[1];
                    const nameParts = username.split('.');
                    if (nameParts.length === 2) {
                        firstName = capitalize(nameParts[0]);
                        lastName = capitalize(nameParts[1]);
                    }
                }

                const phoneMatch = file.name.match(/CLID_(\d+)_/);
                const phoneNumber = phoneMatch ? phoneMatch[1] : '';

                const callData: Partial<CallDetails> = {
                    filename: file.name,
                    status: 'to_process',
                    agent_info: {
                        username: username,
                        first_name: firstName,
                        last_name: lastName,
                        project: projectName,
                    },
                    file_info: {
                        extension: 'wav',
                        duration: 0,
                        day: new Date().toISOString().split('T')[0],
                        file_path: downloadURL
                    },
                    phone_number: phoneNumber
                };

                console.log('Sending data to API:', JSON.stringify(callData, null, 2));

                const result = await uploadCallData(companyData.database, callData);

                console.log('API response:', JSON.stringify(result, null, 2));
            }

            setLoading(false);
            fetchCallsData(page);
            setSelectedFiles(null);
            setIsDialogOpen(false);
            toast({
                title: "Success",
                description: "All files uploaded successfully.",
            });
        } catch (error) {
            console.error('Error during upload:', error);
            toast({
                title: "Error",
                description: "An error occurred during upload. Please try again.",
                variant: "destructive",
            });
            setLoading(false);
        }
    };

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (!companyData?.database) return;

        try {
            await deleteCall(companyData.database, id);
            fetchCallsData(page);
            toast({
                title: "Success",
                description: "Call deleted successfully.",
            });
        } catch (error) {
            console.error('Error deleting call:', error);
            toast({
                title: "Error",
                description: "Failed to delete call. Please try again.",
                variant: "destructive",
            });
        }
    }, [companyData?.database, fetchCallsData, page, toast]);

    const handleViewDetails = useCallback((call: CallDetails) => {
        router.push(`/insights/calls/${call._id}`);
    }, [router]);

    const ringColor = useMemo(() => (theme === 'dark' ? '#ffffff' : '#000000'), [theme]);
    const textColor = useMemo(() => (theme === 'dark' ? '#ffffff' : '#000000'), [theme]);
    const trailColor = useMemo(() => (theme === 'dark' ? '#333333' : '#d6d6d6'), [theme]);

    const formatDuration = useCallback((seconds: number): string => {
        const roundedSeconds = Math.round(seconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const remainingSeconds = roundedSeconds % 60;
        return `${minutes}m ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}s`;
    }, []);

    const renderStatus = useCallback((status: string): React.ReactNode => {
        let statusClass = '';
        let statusText = '';

        switch (status) {
            case 'processed':
                statusClass = 'bg-green-100 text-green-700';
                statusText = t.conversationsTab.statusLabels.done;
                break;
            case 'processing':
                statusClass = 'bg-yellow-100 text-yellow-700';
                statusText = t.conversationsTab.statusLabels.processing;
                break;
            case 'new':
                statusClass = 'bg-blue-100 text-blue-700';
                statusText = t.conversationsTab.statusLabels.new;
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-700';
                statusText = status;
                break;
        }

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
                {statusText}
            </span>
        );
    }, [t.conversationsTab.statusLabels]);

    return (
        <Card className="w-full bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">{t.dashboard.conversations}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t.dashboard.recentConversations}</CardDescription>
                </div>
                <div className='flex items-center justify-between mb-4'>
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={t.callsPage.searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 w-full"
                        />
                    </div>
                    <Button
                        onClick={() => fetchCallsData(page)}
                        disabled={loading}
                        className="ml-4 bg-accent hover:bg-accent/80"
                        size="icon"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="h-4 w-4" />
                        )}
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="ml-4" onClick={() => setIsDialogOpen(true)}>Import Calls</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Calls</DialogTitle>
                                <DialogDescription>Select a project and upload WAV files to import calls.</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col space-y-4 py-4">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="project">Project</Label>
                                    <Select
                                        onValueChange={setSelectedProject}
                                        value={selectedProject}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map((project) => (
                                                <SelectItem key={project._id} value={project._id}>
                                                    {project.project_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="files">WAV Files</Label>
                                    <Input
                                        id="files"
                                        type="file"
                                        accept=".wav"
                                        multiple
                                        onChange={handleFileSelection}
                                    />
                                </div>
                                <Button 
                                    onClick={handleUpload} 
                                    disabled={!selectedFiles || selectedFiles.length === 0 || !selectedProject}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    Upload Files
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <CallsTable
                        calls={calls}
                        loading={loading}
                        handleViewDetails={handleViewDetails}
                        handleDelete={handleDelete}
                        ringColor={ringColor}
                        textColor={textColor}
                        trailColor={trailColor}
                        formatDuration={formatDuration}
                        renderStatus={renderStatus}
                        t={t}
                    />
                </div>
                {!loading && calls.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">{t.common.noDataAvailable}</p>
                )}
                <CustomPagination
                    page={page}
                    totalItems={totalCalls}
                    itemsPerPage={limitPerPage}
                    onPageChange={handlePageChange}
                />
            </CardContent>
        </Card>
    );
}