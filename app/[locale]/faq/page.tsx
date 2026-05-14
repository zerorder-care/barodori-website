import { notFound } from 'next/navigation'
import { FaqAccordion } from '@/components/faq/FaqAccordion'
import { Container } from '@/components/ui/Container'
import { getFaqContent } from '@/lib/api/content'
import { getExternalLinks } from '@/lib/site/config'
import { isLocale } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '자주 묻는 질문 - 바로도리',
    description: '바로도리 서비스, 측정, 결제, 개인정보, 기술 문제에 대한 답변을 확인하세요.',
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
  const search = await searchParams
  const query = normalizeSearchParam(search.q)
  const category = normalizeSearchParam(search.category) || 'all'
  const faq = await getFaqContent({
    category: category === 'all' ? undefined : category,
    q: query,
  })
  const kakao = getExternalLinks().kakaoChannel

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            FAQ
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">자주 묻는 질문</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            궁금한 내용을 검색하거나 카테고리별로 빠르게 확인해보세요.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <FaqAccordion
          locale={loc}
          categories={faq.categories}
          items={faq.items}
          category={category}
          query={query}
          error={faq.error}
        />
        <section className="mt-12 rounded-[8px] bg-[#303030] p-8 text-center text-white">
          <h2 className="text-2xl font-bold">더 궁금한 점이 있으신가요?</h2>
          <p className="mt-3 text-sm text-white/70">카카오톡 채널로 문의를 남겨주시면 운영 시간에 답변드릴게요.</p>
          {kakao && (
            <a
              href={kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#FEE500] px-6 text-sm font-bold text-black"
            >
              카카오톡 문의
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
