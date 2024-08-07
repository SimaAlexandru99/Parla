import React, { Suspense } from 'react';
import { Metadata } from 'next';
import VerifyEmail from '@/components/VerifyEmail';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your Parla account email',
};

const VerifyEmailPage = () => {
  return (
    <main className="min-h-screen bg-teal-900">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmail />
      </Suspense>
    </main>
  );
}

export default VerifyEmailPage;
