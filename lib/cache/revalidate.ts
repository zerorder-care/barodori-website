import { LAB_CACHE_TAG } from '@/lib/api/knowledgeLab'

const ALLOWED_TAGS: readonly string[] = [LAB_CACHE_TAG]

export type RevalidateDecision =
  | { status: 503; body: { error: 'revalidate_token_not_configured' } }
  | { status: 401; body: { error: 'unauthorized' } }
  | { status: 200; body: { revalidated: true; tags: string[] } }

export function decideRevalidate(input: {
  authorization: string | null
  token: string | undefined
  body: unknown
}): RevalidateDecision {
  const token = input.token?.trim()
  if (!token) return { status: 503, body: { error: 'revalidate_token_not_configured' } }
  if (input.authorization !== `Bearer ${token}`) return { status: 401, body: { error: 'unauthorized' } }

  return { status: 200, body: { revalidated: true, tags: allowedTagsFrom(input.body) } }
}

function allowedTagsFrom(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [...ALLOWED_TAGS]
  const raw = (body as { tags?: unknown }).tags
  if (raw === undefined) return [...ALLOWED_TAGS]
  if (!Array.isArray(raw)) return []
  return ALLOWED_TAGS.filter((tag) => raw.includes(tag))
}
