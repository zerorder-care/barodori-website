import { NextResponse, type NextRequest } from 'next/server'
import { isAuthProviderId, type BackendTokenResponse } from '@/lib/auth/session'
import {
  buildErrorRedirect,
  clearAuthCookies,
  decodeOAuthState,
  getFirebaseApiKey,
  postBackendApi,
  setAuthCookies,
  deleteCookie,
} from '@/lib/auth/server'

const OAUTH_STATE_COOKIE = 'barodori_oauth_state'

type ProviderTokenResponse = {
  access_token?: string
  accessToken?: string
  error?: string
  error_description?: string
}

type CustomTokenResponse = {
  customToken?: string
  custom_token?: string
}

type FirebaseCustomTokenResponse = {
  idToken?: string
  error?: {
    message?: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!isAuthProviderId(provider) || (provider !== 'kakao' && provider !== 'naver')) {
    return NextResponse.json({ message: '지원하지 않는 로그인 방식입니다.' }, { status: 404 })
  }

  const storedState = decodeOAuthState(request.cookies.get(`${OAUTH_STATE_COOKIE}_${provider}`)?.value)
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')

  if (!storedState || storedState.state !== state || !code) {
    return buildErrorRedirect(request, storedState?.locale ?? 'ko', 'oauth_state')
  }

  try {
    const redirectUri = new URL(`/api/auth/oauth/${provider}/callback`, request.nextUrl.origin).toString()
    const providerAccessToken = await exchangeProviderCode(provider, code, redirectUri, storedState.state)
    const customTokenData = await postBackendApi<CustomTokenResponse>(
      `/api/v1/auth/token/${provider}`,
      { accessToken: providerAccessToken },
      `auth_${provider}_custom_token`,
    )
    const customToken = customTokenData.customToken ?? customTokenData.custom_token
    if (!customToken) throw new Error(`auth_${provider}_custom_token_missing`)

    const firebaseIdToken = await signInFirebaseWithCustomToken(customToken)
    const tokens = await postBackendApi<BackendTokenResponse>(
      '/api/v1/auth/login/social',
      {
        provider,
        idToken: firebaseIdToken,
      },
      'auth_login',
    )

    const response = NextResponse.redirect(new URL(storedState.nextPath, request.url))
    setAuthCookies(response, tokens)
    deleteCookie(response, `${OAUTH_STATE_COOKIE}_${provider}`)
    return response
  } catch {
    const response = buildErrorRedirect(request, storedState.locale, `${provider}_login_failed`)
    clearAuthCookies(response)
    deleteCookie(response, `${OAUTH_STATE_COOKIE}_${provider}`)
    return response
  }
}

async function exchangeProviderCode(
  provider: 'kakao' | 'naver',
  code: string,
  redirectUri: string,
  state: string,
) {
  const tokenResponse = provider === 'kakao'
    ? await exchangeKakaoCode(code, redirectUri)
    : await exchangeNaverCode(code, redirectUri, state)
  const accessToken = tokenResponse.access_token ?? tokenResponse.accessToken

  if (!accessToken || tokenResponse.error) {
    throw new Error(tokenResponse.error_description ?? tokenResponse.error ?? `auth_${provider}_access_token_missing`)
  }

  return accessToken
}

async function exchangeKakaoCode(code: string, redirectUri: string): Promise<ProviderTokenResponse> {
  const clientId = process.env.KAKAO_REST_API_KEY
  const clientSecret = process.env.KAKAO_CLIENT_SECRET
  if (!clientId) throw new Error('kakao_config_missing')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  })
  if (clientSecret) body.set('client_secret', clientSecret)

  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body,
  })

  return response.json()
}

async function exchangeNaverCode(
  code: string,
  redirectUri: string,
  state: string,
): Promise<ProviderTokenResponse> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('naver_config_missing')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    state,
  })

  const response = await fetch('https://nid.naver.com/oauth2.0/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body,
  })

  return response.json()
}

async function signInFirebaseWithCustomToken(customToken: string) {
  const apiKey = getFirebaseApiKey()
  if (!apiKey) throw new Error('firebase_api_key_missing')

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    },
  )
  const data = (await response.json()) as FirebaseCustomTokenResponse
  if (!response.ok || !data.idToken) {
    throw new Error(data.error?.message ?? 'firebase_custom_token_failed')
  }
  return data.idToken
}
