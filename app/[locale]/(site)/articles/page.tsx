import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata, TORTICOLLIS_KEYWORDS } from '@/lib/seo/metadata'
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
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.article.listSeo.title,
    description: dict.article.listSeo.description,
    path: `/${locale}/articles`,
    locale,
    keywords: locale === 'ko' ? TORTICOLLIS_KEYWORDS : undefined,
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
  const dict = await getDictionary(loc)
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
          <h1 className="text-3xl font-bold leading-snug tracking-tight sm:text-[40px]">{dict.article.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-loose text-[var(--color-text-secondary)] sm:text-base">
            {dict.article.description}
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
            <span className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">{dict.article.searchLabel}</span>
            <input
              name="q"
              defaultValue={query}
              placeholder={dict.article.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        </div>

        {recommended.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-secondary)]">{dict.article.recommendedEyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{dict.article.recommendedTitle}</h2>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{dict.article.recommendedDescription}</p>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {recommended.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-bold">{dict.article.allTitle}</h2>
          {error && (
            <p className="mt-6 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
              {dict.article.loadError}
            </p>
          )}
          {articles.length === 0 ? (
            <p className="mt-8 rounded-[8px] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
              {query ? dict.article.emptyWithQuery.replace('{query}', query) : dict.article.empty}
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
                    {dict.article.more}
                  </Link>
                ) : (
                  <span className="text-sm text-[var(--color-text-secondary)]">{dict.article.end}</span>
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
