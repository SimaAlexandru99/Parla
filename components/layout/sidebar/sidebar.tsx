import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import SidebarSkeleton from './sidebar-skeleton';

const SidebarClient = dynamic(() => import('./sidebar-client'), { 
  ssr: false,
  loading: () => <SidebarSkeleton />
});

const Sidebar = () => {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarClient />
    </Suspense>
  );
};

export default Sidebar;