'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import Loading from '@/components/loading';
import ResetPasswordForm from '@/components/reset-password';
import VerifyEmail from '@/components/verify-email';

const AuthActionComponent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [actionMode, setActionMode] = useState<string | null>(null);
    const [actionCode, setActionCode] = useState<string | null>(null);

    useEffect(() => {
        const handleAction = async () => {
            const mode = searchParams?.get('mode') ?? ''; // Use empty string as default
            const actionCode = searchParams?.get('actionCode') ?? ''; // Use empty string as default
            const continueUrl = searchParams?.get('continueUrl') ?? '';
            const lang = searchParams?.get('lang') || 'ro';

            setActionMode(mode);
            setActionCode(actionCode);

            console.log('Action Mode:', mode);
            console.log('Action Code:', actionCode);
            console.log('Continue URL:', continueUrl);
            console.log('Language:', lang);

            try {
                if (!actionCode) {
                    throw new Error('Cod de acțiune invalid.');
                }

                // Check if the action code is valid
                await checkActionCode(auth, actionCode);

                switch (mode) {
                    case 'verifyEmail':
                        await applyActionCode(auth, actionCode);
                        break;
                    case 'resetPassword':
                        // Action for reset password is handled in the ResetPasswordForm component
                        break;
                    case 'recoverEmail':
                        // handle recover email
                        break;
                    default:
                        throw new Error('Mod invalid.');
                }
            } catch (error: any) {
                console.error('Error handling action:', error);
            } finally {
                setIsLoading(false);
            }
        };

        handleAction();
    }, [searchParams]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen">
            {actionMode === 'verifyEmail' ? (
                <VerifyEmail />
            ) : actionMode === 'resetPassword' && actionCode ? (
                <ResetPasswordForm actionCode={actionCode} />
            ) : (
                <VerifyEmail />
            )}
        </div>
    );
};

const AuthAction = () => (
    <Suspense fallback={<Loading />}>
        <AuthActionComponent />
    </Suspense>
);

export default AuthAction;
