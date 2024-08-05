// app/projects/[id]/page.tsx

import type { Metadata } from 'next'
import ProjectDetailsComponent from '@/components/ProjectDetails'

export const metadata: Metadata = {
    title: 'Project Details',
}

export default function ProjectDetailsPage() {
    return (
        <div className='flex flex-1 flex-col items-center justify-center p-4'>
            <ProjectDetailsComponent />
        </div>
    );
}