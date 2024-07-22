// File: app/(crm)/dashboard.tsx
'use client'

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from "@/contexts/LanguageContext";
import OverviewTab from './tabs/overview';
import ConversationsTab from './tabs/conversations';

export default function DashboardPage() {
    const { t } = useLanguage();

    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6 ">
            <div className="w-full">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className='h-12 justify-start'>
                        <TabsTrigger value="overview" className='h-10'>{t.tabs.overview}</TabsTrigger>
                        <TabsTrigger value="conversations" className='h-10'>{t.tabs.conversations}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <OverviewTab />
                    </TabsContent>
                    <TabsContent value="conversations">
                        <ConversationsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
