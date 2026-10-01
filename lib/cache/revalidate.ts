import { timingSafeEqual } from 'node:crypto'
import { LAB_CACHE_TAG } from '@/lib/api/knowledgeLab'

const ALLOWED_TAGS: readonly string[] = [LAB_CACHE_TAG]

export type RevalidateDecision =
  | { status: 503; body: { error: 'revalidate_token_not_configured' } }
  | { status: 401; body: { error: 'unauthorized' } }
  | { status: 400; body: { error: 'no_allowed_tags' } }
  | { status: 200; body: { revalidated: true; tags: string[] } }

export function decideRevalidate(input: {
  authorization: string | null
  token: string | undefined
  body: unknown
}): RevalidateDecision {
  const token = input.token?.trim()
  if (!token) return { status: 503, body: { error: 'revalidate_token_not_configured' } }
  if (!matchesToken(input.authorization, `Bearer ${token}`)) return { status: 401, body: { error: 'unauthorized' } }

  const tags = allowedTagsFrom(input.body)
  // 아는 태그가 하나도 없으면 비울 것이 없다. revalidated: true로 답하면 부르는 쪽은
  // 캐시가 비워진 줄 알고 넘어가므로, 오타 난 태그를 보냈다는 사실을 400으로 알린다.
  if (tags.length === 0) return { status: 400, body: { error: 'no_allowed_tags' } }

  return { status: 200, body: { revalidated: true, tags } }
}

// 길이가 같은 틀린 토큰을 앞자리부터 맞춰 보는 공격을 막으려고 바이트 수와 무관하게
// 같은 시간이 걸리는 비교를 쓴다. 길이가 다르면 timingSafeEqual이 던지므로 먼저 거른다.
function matchesToken(authorization: string | null, expected: string): boolean {
  if (authorization === null) return false
  const received = Buffer.from(authorization, 'utf8')
  const wanted = Buffer.from(expected, 'utf8')
  if (received.length !== wanted.length) return false
  return timingSafeEqual(received, wanted)
}

function allowedTagsFrom(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [...ALLOWED_TAGS]
  const raw = (body as { tags?: unknown }).tags
  if (raw === undefined) return [...ALLOWED_TAGS]
  if (!Array.isArray(raw)) return []
  return ALLOWED_TAGS.filter((tag) => raw.includes(tag))
}
