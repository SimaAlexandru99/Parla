'use client'

import React, { useState } from 'react'
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useForm, SubmitHandler } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/client/LanguageContext"
import Link from 'next/link'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

interface ForgotPasswordFormData {
  email: string
}

const ForgotPassword = () => {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, data.email)
      setShowDialog(true)
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        variant: "destructive",
        title: t.errors.passwordResetError,
        description: t.errors.generalError,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    router.push('/signin')
  }

  return (
    <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>

      <Card className="m-auto w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="p-6">
          <Image src="/logo.png" alt="Parla Logo" width={50} height={50} />
          <CardTitle className="text-2xl text-white mt-4">{t.forgotPasswordPage.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">{t.forgotPasswordPage.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.forgotPasswordPage.emailPlaceholder}
                {...register("email", {
                  required: t.errors.emailRequired,
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: t.errors.invalidEmail
                  }
                })}
                className="bg-zinc-800 text-white border-zinc-700"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
            >
              {loading ? t.forgotPasswordPage.sendingButton : t.forgotPasswordPage.sendButton}
            </Button>
          </form>
          <p className="text-center mt-6 text-zinc-400">
            {t.forgotPasswordPage.rememberPassword}{" "}
            <Link href="/signin" className="underline">{t.forgotPasswordPage.signIn}</Link>
          </p>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>{t.forgotPasswordPage.successTitle}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {t.forgotPasswordPage.successMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleDialogClose} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
            {t.forgotPasswordPage.backToSignIn}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ForgotPassword