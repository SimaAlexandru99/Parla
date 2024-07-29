import React from "react";
import Login from '@/components/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login', // This will result in "Login | [Your App Name]"
};

export default function LoginPage() {
    return (
        <main>
            <Login />
        </main>
    );
}