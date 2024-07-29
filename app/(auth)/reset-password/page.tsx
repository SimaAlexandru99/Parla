import type { Metadata } from 'next'
import ResetPassword from '@/components/ResetPassword'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your Parla account password',
  openGraph: {
    title: 'Reset Password',
    description: 'Reset your Parla account password',
    type: 'website',
    url: 'https://parla.com/reset-password',
    images: [
      {
        url: 'https://parla.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Parla Reset Password',
      },
    ],
  },
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-teal-900">
      <ResetPassword />
    </main>
  )
}