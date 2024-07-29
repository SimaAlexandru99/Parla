import React from "react";
import SignIn from '@/components/SignIn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Sign in to your account',
    openGraph: {
        title: 'Login',
        description: 'Sign in to your Parla account',
        type: 'website',
        url: 'https://yourapp.com/signin',
        images: [
            {
                url: 'https://yourapp.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Parla Login',
            },
        ],
    },
};

export default function LoginPage() {
    return (
        <main className="min-h-screen">
            <SignIn />
        </main>
    );
}