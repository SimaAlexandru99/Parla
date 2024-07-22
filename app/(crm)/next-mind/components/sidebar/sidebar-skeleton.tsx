import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SidebarSkeleton = () => {
  return (
    <aside className="relative left-0 top-0 z-[999] flex h-screen w-18 bg-background shadow-lg">
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-start p-4">
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
        <nav className="flex flex-col items-center w-full gap-2 px-2 py-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex w-full items-center gap-3 px-2 py-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="flex-1 h-4 rounded-md" />
            </div>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-2 py-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex w-full items-center gap-3 px-2 py-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="flex-1 h-4 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
