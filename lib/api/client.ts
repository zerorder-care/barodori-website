export type ApiEnvelope<T> = {
  code?: number
  message?: string
  data?: T
}

const DEFAULT_VERCEL_API_BASE_URL = 'https://staging.api.barodori.com'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.barodori.com'

export function getApiBaseUrl(): string | null {
  const configured = process.env.BARODORI_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured) return configured.replace(/\/$/, '')
  if (process.env.VERCEL_URL?.endsWith('.vercel.app')) return DEFAULT_VERCEL_API_BASE_URL
  if (process.env.NODE_ENV === 'production') return DEFAULT_PRODUCTION_API_BASE_URL
  return null
}

export async function fetchBackendApi<T>(apiBaseUrl: string, path: string, errorPrefix: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`${errorPrefix}_http_${response.status}`)
  }

  const payload = (await response.json()) as ApiEnvelope<T>
  if (payload.code !== undefined && payload.code !== 0) {
    throw new Error(payload.message ?? `${errorPrefix}_code_${payload.code}`)
  }
  if (!payload.data) {
    throw new Error(`${errorPrefix}_empty_data`)
  }
  return payload.data
}
