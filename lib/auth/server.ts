import { NextResponse } from 'next/server'
import { getApiBaseUrl, type ApiEnvelope } from '@/lib/api/client'
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  AUTH_STATE_COOKIE,
  type BackendTokenResponse,
  normalizeBackendTokens,
} from '@/lib/auth/session'

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

export type OAuthState = {
  state: string
  locale: string
  nextPath: string
}

export function getSecureCookieOption() {
  return process.env.NODE_ENV === 'production'
}

export function getFirebaseApiKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''
}

export function setAuthCookies(response: NextResponse, tokenPayload: BackendTokenResponse) {
  const tokens = normalizeBackendTokens(tokenPayload)
  const secure = getSecureCookieOption()

  response.cookies.set(AUTH_ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: tokens.expiresIn,
  })
  response.cookies.set(AUTH_REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  })
  response.cookies.set(AUTH_STATE_COOKIE, 'signed-in', {
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  })
}

export function clearAuthCookies(response: NextResponse) {
  deleteCookie(response, AUTH_ACCESS_COOKIE)
  deleteCookie(response, AUTH_REFRESH_COOKIE)
  deleteCookie(response, AUTH_STATE_COOKIE)
}

export function deleteCookie(response: NextResponse, name: string) {
  response.cookies.set(name, '', {
    path: '/',
    maxAge: 0,
  })
}

export async function postBackendApi<T>(path: string, body: unknown, errorPrefix: string): Promise<T> {
  const apiBaseUrl = getApiBaseUrl()
  if (!apiBaseUrl) {
    throw new Error(`${errorPrefix}_api_base_missing`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    throw new Error(payload?.message ?? `${errorPrefix}_http_${response.status}`)
  }
  if (!payload || (payload.code !== undefined && payload.code !== 0)) {
    throw new Error(payload?.message ?? `${errorPrefix}_code_${payload?.code ?? 'unknown'}`)
  }
  if (!payload.data) {
    throw new Error(`${errorPrefix}_empty_data`)
  }

  return payload.data
}

export function buildErrorRedirect(request: Request, locale: string, error: string) {
  const url = new URL(`/${locale}/login`, request.url)
  url.searchParams.set('error', error)
  return NextResponse.redirect(url)
}

export function normalizeNextPath(value: string | null, locale: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return `/${locale}/mypage`
  return value
}

export function encodeOAuthState(state: OAuthState) {
  return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url')
}

export function decodeOAuthState(value: string | undefined): OAuthState | null {
  if (!value) return null
  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as OAuthState
    if (!decoded.state || !decoded.locale || !decoded.nextPath) return null
    return decoded
  } catch {
    return null
  }
}
