'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/client/UserContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserDropdownMenu from '@/components/client/UserDropdownMenu';
import { useLanguage } from '@/contexts/client/LanguageContext';
import Image from 'next/image';

export default function HeaderClient() {
  const { email, loading } = useUser();
  const { t } = useLanguage();
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsClientLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const isLoggedIn = !!email;

  if (loading || !isClientLoaded) {
    return (
      <header className="bg-black p-6 flex justify-between items-center">
        <div className="flex items-center">
          <Skeleton className="w-[100px] h-[40px]" /> {/* Logo skeleton */}
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-[60px] h-[20px]" /> {/* License link skeleton */}
          <Skeleton className="w-[60px] h-[20px]" /> {/* Pricing link skeleton */}
          <Skeleton className="w-[120px] h-[40px] rounded-md" /> {/* Button skeleton */}
          <Skeleton className="w-[40px] h-[40px] rounded-full" /> {/* UserDropdownMenu skeleton */}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/">
          <Image src="/parla-logo.png" alt="Parla" width={100} height={40} />
        </Link>
      </div>
      <nav className="flex items-center space-x-4">
        <Link href="/license" className="text-white hover:text-gray-300 transition-colors">
          {t.links.license}
        </Link>
        <Link href="/pricing" className="text-white hover:text-gray-300 transition-colors">
          {t.headers.pricing}
        </Link>
        <Link href={isLoggedIn ? "/insights/dashboard" : "/get-started"}>
          <Button className="bg-accent hover:bg-accent/90 text-black text-lg font-medium px-4 py-2">
            {isLoggedIn ? t.headers.dashboard : t.headers.getStarted}
          </Button>
        </Link>
        <UserDropdownMenu />
      </nav>
    </header>
  );
}