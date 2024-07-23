'use client'

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from "@/contexts/LanguageContext";
import OverviewTab from "@/components/overview";
import ConversationsTab from "@/components/conversations";


export default function ClientSideTabs() {
    const { t } = useLanguage();

    return (
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
    );
}