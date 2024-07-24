import { Metadata } from 'next';
import Agents from '@/components/agents/agents';

export const metadata: Metadata = {
    title: 'Agents',
};

export default function AgentsPage() {
    return (
        <div className="mx-auto max-w-screen-4xl p-4 md:p-6 2xl:p-6">
            <Agents />
        </div>
    );
}
