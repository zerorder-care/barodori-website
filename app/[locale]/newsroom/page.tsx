import { notFound } from 'next/navigation'
import { NewsroomBoard } from '@/components/newsroom/NewsroomBoard'
import { Container } from '@/components/ui/Container'
import { listNewsroomPosts } from '@/lib/api/content'
import { isLocale } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'
import { getExternalLinks } from '@/lib/site/config'
import type { NewsroomCategory } from '@/lib/content/newsroom'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const newsroomCategoryValues = ['notice', 'press', 'partnership', 'event'] as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '뉴스룸 - 바로도리',
    description: '바로도리의 공지, 보도자료, 제휴, 이벤트 소식을 확인하세요.',
    path: `/${locale}/newsroom`,
    locale,
  })
}

export default async function NewsroomPage({
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
  const categoryParam = normalizeSearchParam(search.category)
  const category = isNewsroomCategory(categoryParam) ? categoryParam : 'all'
  const page = parsePage(normalizeSearchParam(search.page))
  const newsroom = await listNewsroomPosts({
    category: category === 'all' ? undefined : category,
    q: query,
    page,
  })
  const kakao = getExternalLinks().kakaoChannel

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            뉴스룸
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">바로도리 소식</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            회사와 서비스의 최신 공지, 보도자료, 제휴 소식을 모았습니다.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <NewsroomBoard
          locale={loc}
          categories={newsroom.categories}
          posts={newsroom.posts}
          category={category}
          query={query}
          nextPage={newsroom.nextPage}
          error={newsroom.error}
        />
      </Container>

      <section className="bg-[#303030] py-20 text-white">
        <Container className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/60">Media & Partnership</p>
            <h2 className="mt-3 text-3xl font-bold">보도자료와 제휴 문의가 필요하신가요?</h2>
            <p className="mt-3 text-sm text-white/70">카카오톡 채널로 문의를 남겨주시면 담당자가 확인 후 안내드릴게요.</p>
          </div>
          {kakao && (
            <a
              href={kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-white px-6 text-sm font-bold text-black"
            >
              문의하기
            </a>
          )}
        </Container>
      </section>
    </>
  )
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10)
  if (!Number.isFinite(page)) return 1
  return Math.max(1, page)
}

function isNewsroomCategory(value: string): value is NewsroomCategory {
  return newsroomCategoryValues.includes(value as NewsroomCategory)
}
