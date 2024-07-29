// components/ConfirmEmail.tsx

'use client'

import React, { useEffect } from 'react'
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/client/LanguageContext"

const ConfirmEmail = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    toast({
      title: t.confirmEmailPage.successTitle,
      description: t.confirmEmailPage.successMessage,
    })
  }, [toast, t])

  const handleBackToSignIn = () => {
    router.push('/signin')
  }

  return (
    <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>

      <Card className="m-auto w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="p-6">
          <Image src="/logo.png" alt="Parla Logo" width={50} height={50} />
          <CardTitle className="text-2xl text-white mt-4">{t.confirmEmailPage.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 text-white">
            <p>{t.confirmEmailPage.message}</p>
            <Button
              onClick={handleBackToSignIn}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {t.confirmEmailPage.backToSignIn}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfirmEmail
