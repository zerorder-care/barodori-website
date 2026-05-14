import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '@/lib/auth/session'
import { clearAuthCookies, postBackendApi } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: Boolean(request.cookies.get(AUTH_ACCESS_COOKIE)?.value),
  })
}

export async function DELETE(request: NextRequest) {
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value

  if (refreshToken) {
    await postBackendApi('/api/v1/auth/logout', { refreshToken }, 'auth_logout').catch(() => null)
  }

  const response = NextResponse.json({ ok: true })
  clearAuthCookies(response)
  return response
}
