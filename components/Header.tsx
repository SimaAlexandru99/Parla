// components/Header.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeaderSkeleton from './HeaderSkeleton';

const HeaderServer = dynamic(() => import('./server/HeaderServer'), {
  loading: () => <HeaderSkeleton />,
  ssr: false
});

const HeaderClient = dynamic(() => import('./client/HeaderClient'), {
  ssr: false
});

export default function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderServer>
        <HeaderClient />
      </HeaderServer>
    </Suspense>
  );
}