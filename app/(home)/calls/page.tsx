import { Metadata } from 'next'
import Calls from '@/components/server/CallsServer' // Changed to server component

export const metadata: Metadata = {
    title: 'Calls',
}

// Async server component
export default async function CallsPage() {
    // Server-side data fetching could be done here
    // const initialData = await fetchInitialCallsData();

    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <Calls />
        </div>
    )
}