import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, type Locale } from '@/lib/i18n/config'
import { isLocale } from '@/lib/i18n/dictionary'
import { isAuthProviderId } from '@/lib/auth/session'
import { encodeOAuthState, getSecureCookieOption, normalizeNextPath, type OAuthState } from '@/lib/auth/server'

const OAUTH_STATE_COOKIE = 'barodori_oauth_state'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!isAuthProviderId(provider) || (provider !== 'kakao' && provider !== 'naver')) {
    return NextResponse.json({ message: '지원하지 않는 로그인 방식입니다.' }, { status: 404 })
  }

  const localeParam = request.nextUrl.searchParams.get('locale') ?? defaultLocale
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const nextPath = normalizeNextPath(request.nextUrl.searchParams.get('next'), locale)
  const state = crypto.randomUUID()
  const redirectUri = new URL(`/api/auth/oauth/${provider}/callback`, request.nextUrl.origin).toString()
  const authUrl = buildProviderAuthorizeUrl(provider, redirectUri, state)

  if (!authUrl) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('error', `${provider}_config_missing`)
    return NextResponse.redirect(loginUrl)
  }

  const response = NextResponse.redirect(authUrl)
  const statePayload: OAuthState = { state, locale, nextPath }
  response.cookies.set(`${OAUTH_STATE_COOKIE}_${provider}`, encodeOAuthState(statePayload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: getSecureCookieOption(),
    path: '/',
    maxAge: 60 * 10,
  })
  return response
}

function buildProviderAuthorizeUrl(provider: 'kakao' | 'naver', redirectUri: string, state: string) {
  if (provider === 'kakao') {
    const clientId = process.env.KAKAO_REST_API_KEY
    if (!clientId) return null
    const url = new URL('https://kauth.kakao.com/oauth/authorize')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('state', state)
    return url
  }

  const clientId = process.env.NAVER_CLIENT_ID
  if (!clientId) return null
  const url = new URL('https://nid.naver.com/oauth2.0/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  return url
}
