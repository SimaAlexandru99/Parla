import ChatInterface from '../../../components/NextAi';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'NextAI',
}


export default function NextAIPage() {
    return (
        <div className='flex flex-1 flex-col items-center justify-center h-screen'>
            <ChatInterface />
        </div>
    );
}