// pages/action.tsx

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const ActionHandler = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!searchParams) {
      router.push('/error')
      return
    }

    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (!mode || !oobCode) {
      router.push('/error')
      return
    }

    switch (mode) {
      case 'resetPassword':
        router.push(`/reset-password?oobCode=${oobCode}`)
        break
      case 'verifyEmail':
        router.push(`/confirm-email?oobCode=${oobCode}`)
        break
      default:
        router.push('/error')
        break
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen bg-teal-900 justify-center items-center">
      <p className="text-white">Redirecting...</p>
    </div>
  )
}

export default ActionHandler
