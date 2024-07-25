import { Metadata } from 'next'
import Calls from '@/components/calls/Calls';

export const metadata: Metadata = {
    title: 'Calls',
}

export default function CallsPage() {
    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <Calls />
        </div>
    );
}