'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import { useLanguage } from '@/contexts/client/LanguageContext'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

interface PasswordRequirements {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

const ResetPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, handleSubmit, formState: { errors }, getValues, watch } = useForm<ResetPasswordFormData>()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [oobCode, setOobCode] = useState<string | null>(null)
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  const password = watch('password')

  useEffect(() => {
    if (searchParams) {
      const code = searchParams.get('oobCode')
      if (code) {
        setOobCode(code)
        verifyPasswordResetCode(auth, code).catch(() => {
          toast({
            variant: 'destructive',
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

  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        length: password.length >= 9 && password.length <= 64,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      })
    } else {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      })
    }
  }, [password])

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!oobCode) return

    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, data.password)
      setShowDialog(true)
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        variant: 'destructive',
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

  const isPasswordValid = Object.values(passwordRequirements).filter(Boolean).length >= 3

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
                {...register('password', {
                  required: t.errors.passwordRequired,
                  validate: () => isPasswordValid || t.errors.passwordRequirements
                })}
                className="bg-zinc-800 text-white border-zinc-700"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              <div className="mt-2 text-sm">
                <p className="text-white">Password must:</p>
                <ul className="list-disc pl-5 text-white">
                  <li className={passwordRequirements.length ? 'text-green-500' : 'text-red-500'}>
                    Be between 9 and 64 characters
                  </li>
                  <li className={passwordRequirements.uppercase ? 'text-green-500' : 'text-red-500'}>
                    Include an uppercase character
                  </li>
                  <li className={passwordRequirements.lowercase ? 'text-green-500' : 'text-red-500'}>
                    Include a lowercase character
                  </li>
                  <li className={passwordRequirements.number ? 'text-green-500' : 'text-red-500'}>
                    Include a number
                  </li>
                  <li className={passwordRequirements.special ? 'text-green-500' : 'text-red-500'}>
                    Include a special character
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white">{t.resetPasswordPage.confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: t.errors.confirmPasswordRequired,
                  validate: (value) => value === getValues('password') || t.errors.passwordMismatch
                })}
                className="bg-zinc-800 text-white border-zinc-700"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={loading || !isPasswordValid}
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