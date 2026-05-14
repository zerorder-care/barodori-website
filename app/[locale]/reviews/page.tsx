import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { InstallCta } from '@/components/marketing/InstallCta'
import { ReviewsBoard } from '@/components/reviews/ReviewsBoard'
import { expertRecommendations, mediaMentions } from '@/lib/content/reviews'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '보호자 후기 - 바로도리',
    description: '바로도리를 사용한 보호자들의 이야기와 전문가 추천을 확인하세요.',
    path: `/${locale}/reviews`,
    locale,
  })
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale

  return (
    <>
      <section className="bg-[var(--color-bg-muted)] py-20">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            메인 영역 · 후기 콘텐츠
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
            바로도리를 사용한
            <br />
            보호자들의 이야기
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            실제 사용자 후기와 전문가 추천을 확인해보세요
          </p>
          <div className="mx-auto mt-10 grid max-w-[780px] gap-6 sm:grid-cols-3">
            <TrustMetric label="누적 사용자 수" value="1,200+" />
            <TrustMetric label="평균 별점" value="4.8 ★" />
            <TrustMetric label="만족도" value="96%" />
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <ReviewsBoard />
      </Container>

      <section className="bg-[var(--color-bg-muted)] py-24">
        <Container>
          <div className="text-center">
            <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
              전문가 추천
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">전문 의료진의 추천</h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              가정 재활에 대한 전문가의 시선과 추천 멘트를 확인해보세요
            </p>
          </div>
          <div className="mt-10 rounded-[12px] border border-[var(--color-border)] bg-white p-10">
            <div className="grid gap-8 lg:grid-cols-[160px_1fr] lg:items-center">
              <div className="grid h-32 w-32 place-items-center rounded-full border border-dashed border-[#b9b9b9] bg-[#e7e7e7] text-center text-xs text-[var(--color-text-secondary)]">
                의료진
                <br />
                프로필 사진
              </div>
              <div>
                <p className="text-4xl font-bold text-[#b9b9b9]">“</p>
                <p className="mt-2 leading-relaxed">{expertRecommendations[0]?.quote}</p>
                <p className="mt-5 text-sm font-bold">
                  {expertRecommendations[0]?.name}
                  <span className="ml-3 font-medium text-[var(--color-text-secondary)]">{expertRecommendations[0]?.organization}</span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
              미디어 보도
            </p>
            <h2 className="mt-4 text-3xl font-bold">바로도리, 언론에서 만나보세요</h2>
          </div>
          <Link
            href={`/${loc}/newsroom`}
            className="inline-flex min-h-11 items-center rounded-[8px] border border-[var(--color-text-primary)] px-5 text-sm font-bold"
          >
            뉴스룸에서 더 보기 →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {mediaMentions.map((item) => (
            <a key={item.id} href={item.href} className="rounded-[8px] border border-[var(--color-border)] bg-white p-7">
              <p className="inline-flex rounded-[4px] bg-[#efefef] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {item.outlet}
              </p>
              <h3 className="mt-5 text-lg font-bold leading-snug">{item.title}</h3>
              <time className="mt-10 block text-xs text-[var(--color-text-secondary)]" dateTime={item.publishedAt}>
                {item.publishedAt}
              </time>
            </a>
          ))}
        </div>
      </Container>

      <InstallCta locale={loc} surface="reviews_footer" />
    </>
  )
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-8">
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
    </div>
  )
}
