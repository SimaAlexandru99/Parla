import type { Metadata } from 'next'
import ForgotPassword from '@/components/ForgotPassword'

export const metadata: Metadata = {
  title: 'Forgot Password | Parla',
  description: 'Reset your Parla account password',
  openGraph: {
    title: 'Forgot Password | Parla',
    description: 'Reset your Parla account password',
    type: 'website',
    url: 'https://parla.com/forgot-password',
    images: [
      {
        url: 'https://parla.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Parla Forgot Password',
      },
    ],
  },
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-teal-900">
      <ForgotPassword />
    </main>
  )
}