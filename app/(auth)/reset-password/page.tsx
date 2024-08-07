import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPassword from '@/components/ResetPassword'; // Ensure this path is correct

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your Parla account password',
};

const ResetPasswordPage = () => {
  return (
    <main className="min-h-screen bg-teal-900">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </main>
  );
}

export default ResetPasswordPage;
