import React from "react";
import ClientSideTabs from './client-side-dashboard';

export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6 ">
            <div className="w-full">
                <ClientSideTabs />
            </div>
        </div>
    );
}