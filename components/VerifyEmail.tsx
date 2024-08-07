// components/VerifyEmail.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/client/LanguageContext'
import { Mailbox } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/firebase/config'
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth'
import { useToast } from '@/components/ui/use-toast'

const VerifyEmail = () => {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams ? searchParams.get('email') : null
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        router.push('/get-started')
      }
    })

    return () => unsubscribe()
  }, [router])

  const resendVerificationEmail = async () => {
    setLoading(true)
    const user = auth.currentUser
    if (user) {
      try {
        await sendEmailVerification(user)
        toast({
          title: t.verifyEmailPage.emailResent,
          description: t.verifyEmailPage.checkInbox,
          duration: 5000,
        })
      } catch (error) {
        console.error('Error resending verification email:', error)
        toast({
          variant: 'destructive',
          title: t.errors.emailResendError,
          description: t.errors.tryAgainLater,
          duration: 5000,
        })
      }
    } else {
      toast({
        variant: 'destructive',
        title: t.errors.userNotFound,
        description: t.errors.trySignInAgain,
        duration: 5000,
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>
      
      <Card className="m-auto w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="p-6 text-center">
          <Mailbox className="w-16 h-16 mx-auto text-accent mb-4" />
          <CardTitle className="text-2xl text-white">{t.verifyEmailPage.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-white">
          <p className="mb-4">
            {t.verifyEmailPage.sentMessage.replace('{email}', email || '')}
          </p>
          <ul className="list-disc pl-5 mb-6">
            <li>{t.verifyEmailPage.checkInbox}</li>
            <li>{t.verifyEmailPage.clickLink}</li>
            <li>{t.verifyEmailPage.checkSpam}</li>
          </ul>
          <p className="mb-6">{t.verifyEmailPage.didntReceive}</p>
          <div className="flex flex-col space-y-4">
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={resendVerificationEmail}
              disabled={loading}
            >
              {loading ? t.verifyEmailPage.resending : t.verifyEmailPage.resendEmail}
            </Button>
            <Link href="/signin" passHref>
              <Button variant="outline" className="w-full">
                {t.verifyEmailPage.backToSignIn}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail