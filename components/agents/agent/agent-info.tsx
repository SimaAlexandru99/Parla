'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from "@/contexts/LanguageContext";
import { AgentDetails } from '@/types/PropsTypes';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentDetailsClient({ initialAgent }: { initialAgent: AgentDetails }) {
    const { t } = useLanguage();
    const [agent] = useState<AgentDetails>(initialAgent);

    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <div className='w-full'>
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="stats">Statistics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-200px)] gap-4">
                            <Card className="flex-1 flex flex-col overflow-hidden">
                                <CardHeader className="flex-shrink-0">
                                    <CardTitle>{`${agent.first_name} ${agent.last_name}`}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-hidden">
                                    <ScrollArea className="h-full">
                                        <div className="space-y-4 pr-4">
                                            <p><strong>Username:</strong> {agent.username}</p>
                                            <p><strong>Project:</strong> {agent.project}</p>
                                            <p><strong>ID:</strong> {agent._id}</p>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <div className="w-full lg:w-1/4 flex flex-col gap-4">
                                <Card className="bg-primary text-primary-foreground">
                                    <CardHeader className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary-foreground text-primary">
                                                    {`${agent.first_name[0]}${agent.last_name[0]}`}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg text-primary-foreground">{`${agent.first_name} ${agent.last_name}`}</CardTitle>
                                                <p className="text-sm text-primary-foreground/80">Agent</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="stats">
                        <ScrollArea>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-4">
                                    {/* Placeholder for future statistics components */}
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
