import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata, TORTICOLLIS_KEYWORDS } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { CategoryFilter } from '@/components/article/CategoryFilter'
import { LabArticleCard } from '@/components/article/LabArticleCard'
import { MonthlyTrackList } from '@/components/article/MonthlyTrackList'
import { InstallCta } from '@/components/marketing/InstallCta'
import { SafetyNotice } from '@/components/marketing/SafetyNotice'
import { listLabContents } from '@/lib/api/knowledgeLab'
import { articleCategoryLabels, isArticleCategory, type ArticleCategory } from '@/lib/content/categories'
import { matchesQuery, toLabArticleCard } from '@/lib/content/labArticle'
import type { Locale } from '@/lib/i18n/config'

const RECOMMENDED_COUNT = 3

// 목록 fetch는 revalidate 86400과 lab-content 태그를 달고 있다. 기본값 auto는
// searchParams 같은 요청 시점 API 뒤에 발견된 fetch를 캐시하지 않는다고 문서에 적혀 있다.
// 실측으로는 그 경우에도 캐시가 동작했지만, 경계에 기대지 않도록 여기서 못을 박는다.
export const fetchCache = 'default-cache'

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
  searchParams: Promise<{ cat?: string; q?: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale

  // 두 요청은 locale만 있으면 되므로 searchParams를 읽기 전에 시작한다.
  // 분류와 검색어는 내려받은 목록을 서버에서 거르는 데만 쓴다.
  const [labResult, monthlyResult] = await Promise.all([
    listLabContents({ locale: loc, collection: 'head_shape_lab' }),
    listLabContents({ locale: loc, collection: 'home_monthly_information' }),
  ])
  const error = labResult.error ?? monthlyResult.error

  const sp = await searchParams
  const dict = await getDictionary(loc)

  const category: ArticleCategory | undefined = sp.cat && isArticleCategory(sp.cat) ? sp.cat : undefined
  const query = typeof sp.q === 'string' ? sp.q.trim() : ''

  const labCards = labResult.items.map((item) =>
    toLabArticleCard(item, { collection: 'head_shape_lab', locale: loc }),
  )
  const monthlyCards = monthlyResult.items.map((item) =>
    toLabArticleCard(item, { collection: 'home_monthly_information', locale: loc }),
  )

  // 백엔드 정렬이 배치 순서를 먼저 보므로 앞 3편이 노션에서 상단 노출로 지정한 글이다.
  const showRecommended = !category && query.length === 0
  const recommended = showRecommended ? labCards.slice(0, RECOMMENDED_COUNT) : []

  // 두상연구소 카드는 monthly로 분류되지 않으므로 cat=monthly면 이 필터가 빈 배열을 낸다.
  const gridCards = labCards
    .filter((card) => !category || card.category === category)
    .filter((card) => matchesQuery(card, query))
  const monthlyRows =
    category && category !== 'monthly' ? [] : monthlyCards.filter((card) => matchesQuery(card, query))
  const isEmpty = gridCards.length === 0 && monthlyRows.length === 0

  const monthLabels = {
    trackTorticollis: dict.article.trackTorticollis,
    trackHeadShape: dict.article.trackHeadShape,
    monthRange: dict.article.monthRange,
    monthRangeSpan: dict.article.monthRangeSpan,
    monthPlus: dict.article.monthPlus,
  }

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
          <CategoryFilter locale={loc} label={dict.article.categoryFilterLabel} />
          <form
            action={`/${loc}/articles`}
            className="flex min-h-12 min-w-0 items-center rounded-[8px] border border-[var(--color-border)] bg-white px-4 lg:w-72"
          >
            {category && <input type="hidden" name="cat" value={category} />}
            <label htmlFor="article-search" className="mr-3 text-sm font-semibold text-[var(--color-text-secondary)]">
              {dict.article.searchLabel}
            </label>
            <input
              id="article-search"
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
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {dict.article.recommendedDescription}
              </p>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {recommended.map((card) => (
                <LabArticleCard key={card.id} card={card} readingTimeLabel={dict.article.readingTime} />
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
          {isEmpty ? (
            <p className="mt-8 rounded-[8px] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
              {query ? dict.article.emptyWithQuery.replace('{query}', query) : dict.article.empty}
            </p>
          ) : (
            <>
              {gridCards.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {gridCards.map((card) => (
                    <LabArticleCard key={card.id} card={card} readingTimeLabel={dict.article.readingTime} />
                  ))}
                </div>
              )}
              {monthlyRows.length > 0 && (
                <section className="mt-14">
                  <h3 className="text-xl font-bold">{articleCategoryLabels.monthly[loc]}</h3>
                  <div className="mt-6">
                    <MonthlyTrackList cards={monthlyRows} labels={monthLabels} />
                  </div>
                </section>
              )}
            </>
          )}
        </section>
      </Container>

      <SafetyNotice locale={loc} />
      <InstallCta locale={loc} surface="articles_footer" />
    </>
  )
}
