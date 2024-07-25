import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HeaderClient = dynamic(() => import('@/components/client/InsightsHeaderClient'), {
  ssr: false,
  loading: () => <HeaderSkeleton />
});

const HeaderSkeleton = () => (
  <header className="sticky top-0 z-[998] bg-background flex w-full drop-shadow-1 dark:drop-shadow-none">
    <div className="flex items-center gap-4 w-full justify-between p-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-50 h-10" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  </header>
);

const InsightsHeader = () => {
  return <HeaderClient />;
};

export default InsightsHeader;