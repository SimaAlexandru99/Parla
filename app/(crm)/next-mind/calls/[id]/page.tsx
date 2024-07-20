'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchUserCompanyDatabase from "@/hooks/useFetchUserCompanyDatabase";
import { fetchCallDetails } from '@/lib/apiClient'; // We'll need to create this function
import { CallDetails } from '@/types/PropsTypes';

export default function CallDetailsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params?.id as string;
  const { companyData } = useFetchUserCompanyDatabase();
  const [call, setCall] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCallDetails = async () => {
      if (id && companyData?.database) {
        try {
          const callData = await fetchCallDetails(companyData.database, id);
          setCall(callData);
        } catch (error) {
          console.error('Failed to fetch call details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCallDetails();
  }, [id, companyData?.database]);

  if (loading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!call) {
    return <div>{t.common.noDataAvailable}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Info apel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Numar de telefon</h3>
            <p>{call.phone_number}</p>
          </div>
          <div>
            <h3 className="font-semibold">Nume complet</h3>
            <p>{`${call.agent_info.first_name} ${call.agent_info.last_name}`}</p>
          </div>
          <div>
            <h3 className="font-semibold">Proiect</h3>
            <p>{call.agent_info.project}</p>
          </div>
          <div>
            <h3 className="font-semibold">Scor</h3>
            <p>{call.score}</p>
          </div>
          <div>
            <h3 className="font-semibold">Durata</h3>
            <p>{call.file_info.duration} seconds</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{call.status}</p>
          </div>
          <div>
            <h3 className="font-semibold">Sentiment</h3>
            <p>{call.average_sentiment}</p>
          </div>
          <div>
            <h3 className="font-semibold">Crosstalk</h3>
            <p>{call.crosstalk_duration} seconds</p>
          </div>
          <div>
            <h3 className="font-semibold">Dead Air</h3>
            <p>Speaker 00: {call.total_dead_air_duration.SPEAKER_00} seconds</p>
            <p>Speaker 01: {call.total_dead_air_duration.SPEAKER_01} seconds</p>
          </div>
          <div>
            <h3 className="font-semibold">Total Talk</h3>
            <p>Speaker 00: {call.total_talk_duration.SPEAKER_00} seconds</p>
            <p>Speaker 01: {call.total_talk_duration.SPEAKER_01} seconds</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Rezumat apel</h3>
          <p>{call.call_summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}