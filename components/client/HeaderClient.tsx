'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/client/UserContext';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserDropdownMenu from "@/components/client/UserDropdownMenu"; // Adjust the import path as needed
import { useLanguage } from '@/contexts/client/LanguageContext';

export default function HeaderClient() {
  const { email, loading } = useUser();
  const { t } = useLanguage();
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    // Simulate a delay to match the server-side loading
    const timer = setTimeout(() => setIsClientLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const isLoggedIn = !!email;

  if (loading || !isClientLoaded) {
    return (
      <>
        <Skeleton className="w-[160px] h-[40px]" />
        <Skeleton className="w-[40px] h-[40px] rounded-full" />
      </>
    );
  }

  return (
    <>
      <Link href={isLoggedIn ? "/insights/dashboard" : "/get-started"}>
        <Button className="bg-accent hover:bg-accent/90 text-black text-lg font-medium px-10 py-6">
          {isLoggedIn ? t.headers.dashboard : t.headers.getStarted}
        </Button>
      </Link>
      <UserDropdownMenu />
    </>
  );
}
