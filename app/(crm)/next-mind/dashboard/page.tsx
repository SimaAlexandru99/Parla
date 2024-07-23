import React from "react";
import Dashboard from '@/components/dashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard', // This will result in "Dashboard | NextMind"
}


export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6 ">
            <div className="w-full">
                <Dashboard />
            </div>
        </div>
    );
}