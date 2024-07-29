import React from "react";
import SignUp from '@/components/SignUp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create your account',
    openGraph: {
        title: 'Sign Up | Parla',
        description: 'Create your Parla account',
        type: 'website',
        url: 'https://yourapp.com/signup',
        images: [
            {
                url: 'https://yourapp.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Parla Sign Up',
            },
        ],
    },
};

export default function SignUpPage() {
    return (
        <main className="min-h-screen">
            <SignUp />
        </main>
    );
}