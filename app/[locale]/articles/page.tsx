import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { CategoryFilter } from '@/components/article/CategoryFilter'
import { ArticleCard } from '@/components/article/ArticleCard'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { listArticlePosts } from '@/lib/api/articles'
import { isCategory, type Category } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '홈케어 노트 - 아기 사경·터미타임 기록 참고',
    description: '아기 사경이 걱정될 때, 터미타임을 시작할 때, 두상 비대칭을 기록할 때 상담 전 참고할 수 있는 안전 노트를 확인하세요.',
    path: `/${locale}/articles`,
    locale,
  })
}

export default async function ArticlesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cat?: string; q?: string; offset?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const category: Category | undefined = sp.cat && isCategory(sp.cat) ? sp.cat : undefined
  const query = typeof sp.q === 'string' ? sp.q.trim() : ''
  const offset = parseOffset(sp.offset)
  const [recommendedResult, articleResult] = await Promise.all([
    listArticlePosts({ locale: loc, limit: 3 }),
    listArticlePosts({ locale: loc, category, q: query, offset, limit: 20 }),
  ])
  const recommended = recommendedResult.articles
  const articles = articleResult.articles
  const error = articleResult.error ?? recommendedResult.error
  const nextOffset = articleResult.nextOffset
  const hasMore = articleResult.hasMore

  const moreHref = buildArticlesHref(loc, {
    category,
    q: query,
    offset: nextOffset ?? undefined,
  })

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            홈케어 노트
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">아기 사경·터미타임이 걱정될 때 참고할 기록 노트</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            진단이나 치료 판단을 대신하지 않고, 목 관찰, 두상 비대칭, 터미타임, 홈케어 운동 기록을 상담 전 정리하는 데 도움이 되는 글을 모았습니다.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="flex flex-col gap-4 border-y border-[var(--color-border)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter locale={loc} />
          <form
            action={`/${loc}/articles`}
            className="flex min-h-12 min-w-0 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4 lg:w-72"
          >
            {category && <input type="hidden" name="cat" value={category} />}
            <span className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">검색</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="노트 검색"
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        </div>

        {recommended.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">처음 읽는 가이드</p>
                <h2 className="mt-2 text-2xl font-bold">상담 전 정리에 참고하세요</h2>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">아기 사경, 두상 비대칭, 터미타임 기록을 시작하는 보호자를 위한 추천 콘텐츠</p>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {recommended.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-bold">전체 노트</h2>
          {error && (
            <p className="mt-6 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
              노트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}
          {articles.length === 0 ? (
            <p className="mt-8 rounded-[8px] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
              {query ? `'${query}'에 대한 결과가 없어요.` : '아직 등록된 노트가 없어요.'}
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                {hasMore && nextOffset !== null ? (
                  <Link
                    href={moreHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-bold"
                  >
                    다음 노트 보기 +
                  </Link>
                ) : (
                  <span className="text-sm text-[var(--color-text-secondary)]">마지막 노트입니다</span>
                )}
              </div>
            </>
          )}
        </section>
      </Container>

      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="articles_footer" />
    </>
  )
}

function buildArticlesHref(
  locale: Locale,
  params: {
    category?: Category
    q?: string
    offset?: number
  },
) {
  const search = new URLSearchParams()
  if (params.category) search.set('cat', params.category)
  if (params.q?.trim()) search.set('q', params.q.trim())
  if (params.offset) search.set('offset', String(params.offset))
  const queryString = search.toString()
  return queryString ? `/${locale}/articles?${queryString}` : `/${locale}/articles`
}

function parseOffset(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}
