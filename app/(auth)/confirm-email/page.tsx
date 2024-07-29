// pages/confirm-email.tsx

import type { Metadata } from 'next'
import ConfirmEmail from '@/components/ConfirmEmail'

export const metadata: Metadata = {
  title: 'Email Confirmed',
  description: 'Your email has been successfully confirmed',
  openGraph: {
    title: 'Email Confirmed',
    description: 'Your email has been successfully confirmed',
    type: 'website',
    url: 'https://parla.com/confirm-email',
    images: [
      {
        url: 'https://parla.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Parla Email Confirmed',
      },
    ],
  },
}

export default function ConfirmEmailPage() {
  return (
    <main className="min-h-screen bg-teal-900">
      <ConfirmEmail />
    </main>
  )
}
