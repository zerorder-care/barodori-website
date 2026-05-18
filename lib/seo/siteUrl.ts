export const DEFAULT_SITE_URL = 'https://www.barodori.com'

export function normalizeSiteUrl(value: string | undefined): string {
  const candidate = value?.trim() || DEFAULT_SITE_URL
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`

  try {
    const url = new URL(withProtocol)
    const hostname = url.hostname.toLowerCase()

    if (hostname === 'barodori.com') {
      url.hostname = 'www.barodori.com'
    }
    if (url.hostname === 'www.barodori.com') {
      url.protocol = 'https:'
    }

    return url.origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
}
