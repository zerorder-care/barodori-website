'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type AuthProvider,
} from 'firebase/auth'
import { getFirebaseClientAuth, isFirebaseAuthConfigured } from '@/lib/auth/firebase'
import type { AuthProviderId } from '@/lib/auth/session'
import type { Locale } from '@/lib/i18n/config'

type Provider = {
  id: AuthProviderId
  label: string
  actionLabel: string
  className: string
  mark: string
}

const providers: Provider[] = [
  {
    id: 'kakao',
    label: '카카오톡',
    actionLabel: '카카오톡으로 계속하기',
    mark: 'K',
    className: 'border-[#f1d800] bg-[#FEE500] text-[#191919] hover:bg-[#f4dc00]',
  },
  {
    id: 'google',
    label: 'Google',
    actionLabel: 'Google로 계속하기',
    mark: 'G',
    className: 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]',
  },
  {
    id: 'naver',
    label: 'Naver',
    actionLabel: 'Naver로 계속하기',
    mark: 'N',
    className: 'border-[#03C75A] bg-[#03C75A] text-white hover:bg-[#02b852]',
  },
]

const loginErrorMessages: Record<string, string> = {
  oauth_state: '로그인 요청을 확인하지 못했습니다. 다시 시도해주세요.',
  kakao_config_missing: '카카오 로그인 설정이 아직 연결되지 않았습니다.',
  naver_config_missing: '네이버 로그인 설정이 아직 연결되지 않았습니다.',
  kakao_login_failed: '카카오 로그인에 실패했습니다. 다시 시도해주세요.',
  naver_login_failed: '네이버 로그인에 실패했습니다. 다시 시도해주세요.',
}

export function SocialLoginPanel({
  locale,
  nextPath,
  initialError,
}: {
  locale: Locale
  nextPath: string
  initialError?: string
}) {
  const router = useRouter()
  const [pendingProvider, setPendingProvider] = useState<AuthProviderId | null>(null)
  const [error, setError] = useState(initialError ? loginErrorMessages[initialError] ?? initialError : null)

  async function handleLogin(provider: Provider) {
    setError(null)
    setPendingProvider(provider.id)

    try {
      if (provider.id === 'kakao' || provider.id === 'naver') {
        startServerOAuth(provider.id)
        return
      }

      await loginWithFirebasePopup(provider.id)
      router.push(nextPath)
      router.refresh()
    } catch (loginError) {
      setPendingProvider(null)
      setError(toLoginErrorMessage(loginError))
    }
  }

  async function loginWithFirebasePopup(providerId: 'google' | 'apple') {
    if (!isFirebaseAuthConfigured()) {
      throw new Error('firebase_auth_not_configured')
    }

    const auth = getFirebaseClientAuth()
    const firebaseProvider = buildFirebaseProvider(providerId)
    const credential = await signInWithPopup(auth, firebaseProvider)
    const idToken = await credential.user.getIdToken()
    const response = await fetch('/api/auth/login/social', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        provider: providerId,
        idToken,
      }),
    })
    const payload = (await response.json().catch(() => null)) as { message?: string } | null

    if (!response.ok) {
      throw new Error(payload?.message ?? 'auth_login_failed')
    }
  }

  function startServerOAuth(providerId: 'kakao' | 'naver') {
    const params = new URLSearchParams({
      locale,
      next: nextPath,
    })
    window.location.assign(`/api/auth/oauth/${providerId}/start?${params}`)
  }

  return (
    <div className="mt-6 grid gap-3">
      {providers.map((provider) => {
        const isPending = pendingProvider === provider.id
        return (
          <button
            key={provider.id}
            type="button"
            disabled={pendingProvider !== null}
            className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-[8px] border px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${provider.className}`}
            onClick={() => void handleLogin(provider)}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs font-black text-[#242424]">
              {provider.mark}
            </span>
            {isPending ? '로그인 중...' : provider.actionLabel}
          </button>
        )
      })}
      {error && (
        <p role="alert" className="rounded-[8px] bg-[#fff4f0] px-4 py-3 text-sm font-semibold text-[#b43d1f]">
          {error}
        </p>
      )}
    </div>
  )
}

function buildFirebaseProvider(providerId: 'google' | 'apple'): AuthProvider {
  if (providerId === 'google') {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    return provider
  }

  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')
  return provider
}

function toLoginErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return '로그인에 실패했습니다. 다시 시도해주세요.'
  if (error.message === 'firebase_auth_not_configured') {
    return 'Firebase 로그인 설정이 아직 연결되지 않았습니다.'
  }
  if (error.message.includes('popup-closed-by-user') || error.message.includes('cancelled-popup-request')) {
    return '로그인이 취소되었습니다.'
  }
  return '로그인에 실패했습니다. 다시 시도해주세요.'
}
