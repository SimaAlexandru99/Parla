    import React from 'react';
    import GetStarted from '@/components/GetStarted';
    import type { Metadata } from 'next';

    export const metadata: Metadata = {
        title: 'Get Started',
        description: 'Complete your profile and get started with Parla CRM',
    };

    export default function GetStartedPage() {
        return (
            <main className="min-h-screen">
                <GetStarted />
            </main>
        );
    }