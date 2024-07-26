// components/HeaderSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
  return (
    <header className="bg-black text-white px-8 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-[100px] h-[30px]" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="w-[80px] h-[40px]" />
        <Skeleton className="w-[80px] h-[40px]" />
        <Skeleton className="w-[80px] h-[40px]" />
        <Skeleton className="w-[160px] h-[40px]" />
        <Skeleton className="w-[40px] h-[40px] rounded-full" />
      </div>
    </header>
  );
}