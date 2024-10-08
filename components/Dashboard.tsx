'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from "@/contexts/client/LanguageContext";
import OverviewTab from "@/components/server/OverviewTab";
import ConversationsTab from "@/components/server/ConversationsTab";


export default function Dashboard() {
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