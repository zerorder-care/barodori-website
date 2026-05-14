export const AUTH_ACCESS_COOKIE = 'barodori_access_token'
export const AUTH_REFRESH_COOKIE = 'barodori_refresh_token'
export const AUTH_STATE_COOKIE = 'barodori_auth_state'

export const AUTH_PROVIDER_IDS = ['kakao', 'google', 'naver', 'apple'] as const

export type AuthProviderId = (typeof AUTH_PROVIDER_IDS)[number]

export type BackendTokenResponse = {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  tokenType?: string
  token_type?: string
  expiresIn?: number
  expires_in?: number
}

export function isAuthProviderId(value: string): value is AuthProviderId {
  return AUTH_PROVIDER_IDS.includes(value as AuthProviderId)
}

export function normalizeBackendTokens(tokens: BackendTokenResponse) {
  const accessToken = tokens.accessToken ?? tokens.access_token
  const refreshToken = tokens.refreshToken ?? tokens.refresh_token
  const expiresIn = tokens.expiresIn ?? tokens.expires_in

  if (!accessToken || !refreshToken || !expiresIn) {
    throw new Error('auth_tokens_missing')
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
  }
}
