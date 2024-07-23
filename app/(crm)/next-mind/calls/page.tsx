import { Metadata } from 'next'
import CallsInterface from './client-side-calls';

export const metadata: Metadata = {
    title: 'Calls',
}

export default function CallsPage() {
    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <CallsInterface />
        </div>
    );
}