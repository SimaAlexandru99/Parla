'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCallDetails } from '@/lib/apiClient';
import { CallDetails } from '@/types/PropsTypes';
import CallDetailsClient from './call-info';
import { Skeleton } from '@/components/ui/skeleton';

export default function CallDetailsWrapper() {
  const params = useParams();
  const id = params?.id as string;
  const { companyData } = useFetchUserCompanyDatabase();
  const [call, setCall] = useState<CallDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCallDetails() {
      if (id && companyData?.database) {
        try {
          const callData = await fetchCallDetails(companyData.database, id);
          setCall(callData);
        } catch (err) {
          console.error('Failed to fetch call details:', err);
          setError('Failed to load call details. Please try again later.');
        }
      }
    }

    loadCallDetails();
  }, [id, companyData?.database]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!call) {
    return (
      <div className="flex justify-center w-full">
        <div className='flex flex-1 flex-col h-screen gap-4 p-4 md:gap-8 md:p-6 w-full md:w-4/5 lg:w-3/5'>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return <CallDetailsClient initialCall={call} />;
}
