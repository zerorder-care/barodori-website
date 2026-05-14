import { NextResponse } from 'next/server'
import { isAuthProviderId, type BackendTokenResponse } from '@/lib/auth/session'
import { postBackendApi, setAuthCookies } from '@/lib/auth/server'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    provider?: string
    idToken?: string
  } | null

  if (!body?.provider || !isAuthProviderId(body.provider) || !body.idToken) {
    return NextResponse.json({ message: '잘못된 로그인 요청입니다.' }, { status: 400 })
  }

  try {
    const tokens = await postBackendApi<BackendTokenResponse>(
      '/api/v1/auth/login/social',
      {
        provider: body.provider,
        idToken: body.idToken,
      },
      'auth_login',
    )
    const response = NextResponse.json({ ok: true })
    setAuthCookies(response, tokens)
    return response
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      },
      { status: 502 },
    )
  }
}
