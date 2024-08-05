'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/client/UserContext';
import Loading from '@/components/Loading';

export default function InsightsPage() {
  const router = useRouter();
  const { email, loading } = useUser();
  const isLoggedIn = !!email;

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/signin');
      }
    }
  }, [isLoggedIn, loading, router]);

  // Return a loading state while checking auth status
  if (loading) {
    <Loading />
  }

  // This return is just a placeholder, the component will redirect before rendering
  return null;
}