import { notFound } from 'next/navigation'
import { FaqAccordion, type FaqItem } from '@/components/faq/FaqAccordion'
import { Container } from '@/components/ui/Container'
import { listLabContents } from '@/lib/api/knowledgeLab'
import { matchesQuery, toLabArticleCard } from '@/lib/content/labArticle'
import { getExternalLinks } from '@/lib/site/config'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// FAQ 목록 fetch는 revalidate 86400과 lab-content 태그를 달고 있다. 기본값 auto는
// searchParams 같은 요청 시점 API 뒤에 발견된 fetch를 캐시하지 않는다고 문서에 적혀 있다.
// 실측으로는 그 경우에도 캐시가 동작했지만, 경계에 기대지 않도록 여기서 못을 박는다.
export const fetchCache = 'default-cache'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.faq.seo.title,
    description: dict.faq.seo.description,
    path: `/${locale}/faq`,
    locale,
  })
}

export default async function FaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale

  // 이 요청은 locale만 있으면 되므로 searchParams를 읽기 전에 시작한다.
  const { items, error } = await listLabContents({ locale: loc, collection: 'head_shape_lab', kind: 'faq' })

  const search = await searchParams
  const dict = await getDictionary(loc)
  const query = normalizeSearchParam(search.q)

  const faqItems: FaqItem[] = items
    .map((item) => toLabArticleCard(item, { collection: 'head_shape_lab', locale: loc }))
    .filter((card) => matchesQuery(card, query))
    .map((card) => ({
      id: card.id,
      question: card.title,
      answer: card.excerpt,
      href: `/${loc}/articles/${card.id}`,
    }))

  const kakao = getExternalLinks().kakaoChannel

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
            {dict.faq.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">{dict.faq.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            {dict.faq.description}
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <FaqAccordion
          locale={loc}
          items={faqItems}
          query={query}
          error={error}
          labels={{
            searchLabel: dict.faq.searchLabel,
            searchPlaceholder: dict.faq.searchPlaceholder,
            loadError: dict.faq.loadError,
            empty: dict.faq.empty,
            emptyWithQuery: dict.faq.emptyWithQuery,
            readMore: dict.faq.readMore,
          }}
        />
        <section className="mt-12 rounded-[8px] bg-[#303030] p-8 text-center text-white">
          <h2 className="text-2xl font-bold">{dict.faq.contactTitle}</h2>
          <p className="mt-3 text-sm text-white/70">{dict.faq.contactBody}</p>
          {kakao && (
            <a
              href={kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#FEE500] px-6 text-sm font-bold text-black"
            >
              {dict.faq.contactCta}
            </a>
          )}
        </section>
      </Container>
    </>
  )
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}
