import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { expertRecommendations, parentReviews } from '@/lib/content/reviews'
import { siteFeatures } from '@/lib/site/features'
import type { Locale } from '@/lib/i18n/config'

export function HomePreviewSections({
  locale,
}: {
  locale: Locale
}) {
  return (
    <>
      {siteFeatures.reviews && (
        <section className="bg-[var(--color-bg-muted)] py-24">
          <Container>
            <SectionHeader
              eyebrow="사용자 후기 하이라이트"
              title="실제 보호자들의 진솔한 이야기"
              description="바로도리와 함께 홈케어 운동 기록을 이어간 가족들의 후기를 만나보세요"
              href={`/${locale}/reviews`}
              linkLabel="더 많은 후기 보기"
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {parentReviews.slice(0, 3).map((review) => (
                <article key={review.id} className="min-h-64 rounded-[8px] border border-[var(--color-border)] bg-white p-7">
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{review.babyAge}</p>
                  <p className="mt-5 text-lg tracking-[0.12em]">★★★★★</p>
                  <h3 className="mt-4 text-lg font-bold leading-snug">“{review.title}”</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{review.body}</p>
                  <div className="mt-8 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>{review.duration}</span>
                    <time dateTime={review.writtenAt}>{review.writtenAt}</time>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-white py-24">
        <Container>
          <SectionHeader
            eyebrow="서비스 방향 · 차별점"
            title="기록이 쌓이면, 아이의 변화가 보여요"
            description="바로도리는 오늘의 작은 목표가 매일 이어지고, 그 변화를 함께 확인하도록 곁에서 도와요."
          />
          <div className="mt-10 rounded-[12px] border border-[var(--color-border)] bg-[#f7f7f7] p-10">
            <div className="grid gap-8 lg:grid-cols-[160px_1fr] lg:items-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full bg-white">
                <Image
                  src="/images/expert/medical-advisor.png"
                  alt="바로도리 서비스 일러스트"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-4xl font-bold text-[#b9b9b9]">“</p>
                <p className="mt-2 max-w-3xl leading-relaxed">
                  {expertRecommendations[0]?.quote ??
                    '집에서 한 운동, 물리치료 방문, 아이 반응을 함께 남기면 다음 상담 전 상황을 조금 더 차분히 정리할 수 있어요.'}
                </p>
                <p className="mt-5 text-sm font-bold">
                  {expertRecommendations[0]?.name ?? '바로도리 팀'}
                  <span className="ml-3 font-medium text-[var(--color-text-secondary)]">
                    {expertRecommendations[0]?.organization ?? '홈케어 운동 기록 서비스'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              ['오늘의 목표에서 출발', '상담 후 정한 운동을 오늘의 목표로 정해두면 무엇부터 할지 헷갈리지 않아요.'],
              ['달성과 연속으로 꾸준함 확인', '목표가 차오르고 연속 운동이 이어지면, 오늘도 한 번 더 힘이 나요.'],
              ['꾸준함을 한눈에', '운동한 날과 쉬어간 날, 연속 운동을 달력으로 돌아보며 홈케어 리듬을 살펴봐요.'],
            ].map(([title, body], index) => (
              <article key={title} className="rounded-[8px] border border-[var(--color-border)] bg-white p-7">
                <p className="text-2xl font-bold text-[#a5a5a5]">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center rounded-[8px] border border-[var(--color-text-primary)] px-5 text-sm font-bold"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
