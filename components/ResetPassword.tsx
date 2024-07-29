'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useForm, SubmitHandler } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/client/LanguageContext"
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

const ResetPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ResetPasswordFormData>()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [oobCode, setOobCode] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams) {
      const code = searchParams.get('oobCode')
      if (code) {
        setOobCode(code)
        verifyPasswordResetCode(auth, code).catch(() => {
          toast({
            variant: "destructive",
            title: t.resetPasswordPage.invalidLinkTitle,
            description: t.resetPasswordPage.invalidLinkMessage,
          })
          router.push('/forgot-password')
        })
      } else {
        router.push('/forgot-password')
      }
    } else {
      router.push('/forgot-password')
    }
  }, [searchParams, router, toast, t])

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!oobCode) return

    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, data.password)
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
          <CardTitle className="text-2xl text-white mt-4">{t.resetPasswordPage.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-white">{t.resetPasswordPage.newPasswordLabel}</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: t.errors.passwordRequired,
                  minLength: { value: 8, message: t.errors.passwordLength }
                })}
                className="bg-zinc-800 text-white border-zinc-700"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white">{t.resetPasswordPage.confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: t.errors.confirmPasswordRequired,
                  validate: (value) => value === getValues("password") || t.errors.passwordMismatch
                })}
                className="bg-zinc-800 text-white border-zinc-700"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading}
            >
              {loading ? t.resetPasswordPage.resettingButton : t.resetPasswordPage.resetButton}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>{t.resetPasswordPage.successTitle}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {t.resetPasswordPage.successMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleDialogClose} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
            {t.resetPasswordPage.backToSignIn}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ResetPassword