import React from 'react'
import VerifyEmail from '@/components/VerifyEmail'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Your Email',
  description: 'Please verify your email address to complete your registration.',
}

const VerifyEmailPage = () => {
  return <VerifyEmail />
}

export default VerifyEmailPage