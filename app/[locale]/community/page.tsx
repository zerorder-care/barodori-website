import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CommunityBoard } from '@/components/community/CommunityBoard'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { Container } from '@/components/ui/Container'
import { listCommunityPosts } from '@/lib/api/community'
import { communityCategories, type CommunityCategory, type CommunitySort } from '@/lib/content/community'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Locale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '보호자 커뮤니티 - 바로도리',
    description: '아이 홈케어 운동 기록과 경험을 나누는 보호자 커뮤니티를 둘러보세요. 의료 판단은 담당 전문의·치료사 상담을 기준으로 해요.',
    path: `/${locale}/community`,
    locale,
  })
}

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; q?: string; sort?: string; offset?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const category = normalizeCategory(sp.category)
  const sort = normalizeSort(sp.sort)
  const query = typeof sp.q === 'string' ? sp.q.trim() : ''
  const offset = parseOffset(sp.offset)
  const result = await listCommunityPosts({
    category: category === 'all' ? undefined : category,
    sort,
    q: query,
    offset,
    limit: 20,
  })

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            커뮤니티
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">홈케어를 이어가는 보호자들의 기록</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            비회원도 커뮤니티 분위기를 미리 확인할 수 있어요. 글 작성과 댓글은 바로도리 앱에서 가능하며, 의료 판단이 필요한 내용은 담당 전문의·치료사와 상담해 주세요.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">커뮤니티 게시글</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">운동일지 · 질문 · 응원 · 바로도리 노트를 둘러보세요.</p>
          </div>
          <Link
            href={`/${loc}/install`}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-5 text-sm font-bold text-[var(--color-text-primary)]"
          >
            앱에서 기록 나누기
          </Link>
        </div>
        <CommunityBoard
          locale={loc}
          posts={result.posts}
          category={category}
          sort={sort}
          query={query}
          nextOffset={result.nextOffset}
          hasMore={result.hasMore}
          error={result.error}
        />
      </Container>
      <SafetyNotice locale={loc} />
    </>
  )
}

function normalizeCategory(value: string | undefined): CommunityCategory | 'all' {
  if (!value) return 'all'
  return communityCategories.some((category) => category.value === value) ? (value as CommunityCategory | 'all') : 'all'
}

function normalizeSort(value: string | undefined): CommunitySort {
  return value === 'latest' ? 'latest' : 'popular'
}

function parseOffset(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}
