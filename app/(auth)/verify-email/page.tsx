'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from '@/lib/firebase/config';
import { sendEmailVerification } from "firebase/auth";
import { AlertInformative } from "@/components/ui/alert-custom";
import ThemeLogo from '@/components/ThemeLogo';
import { useLanguage } from "@/contexts/LanguageContext";
import Loading from '@/components/Loading';

const VerifyEmailComponent = () => {
  const searchParams = useSearchParams();
  const email = searchParams ? searchParams.get("email") : null;
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkEmailVerification = () => {
      const user = auth.currentUser;
      if (user) {
        user.reload().then(() => {
          if (user.emailVerified) {
            router.push('/get-started');
          }
        });
      }
    };

    const intervalId = setInterval(checkEmailVerification, 3000);

    return () => clearInterval(intervalId);
  }, [router]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        alert(t.alerts.notAuthenticated);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t.alerts.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {showAlert && <AlertInformative title={t.titles.success} message={t.alerts.success} />}
      <Card className="w-full max-w-xl p-4 shadow-lg">
        <CardHeader className="flex flex-col items-center text-center">
          <ThemeLogo width={80} height={80} />
          <CardTitle className="text-xl mt-2">{t.titles.verifyEmail}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            {email ? (
              <>{t.descriptions.verifyEmail.replace("{email}", email)}</>
            ) : (
              <>{t.descriptions.emailNotFound}</>
            )}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-4 mt-6">
          <Button onClick={handleResendEmail} disabled={isLoading}>
            {isLoading ? t.buttons.sending : t.buttons.resendEmail}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const VerifyEmail = () => (
  <Suspense fallback={<Loading />}>
    <VerifyEmailComponent />
  </Suspense>
);

export default VerifyEmail;
