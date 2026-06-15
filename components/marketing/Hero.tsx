import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { isAppLive } from '@/lib/install/storeLinks'
import { launchCopy } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  const live = isAppLive()

  return (
    <section className="py-8 sm:py-20">
      <Container className="flex flex-col items-center text-center">
        <div className="max-w-2xl">
          <h1 className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl">
            오늘도 해냈다는 기록이 쌓이도록
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            병원에서 안내받은 홈케어 운동을 오늘의 목표로 정하고, 시간·횟수·아이 반응을 한곳에 남겨보세요.
          </p>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)]">
            상담 전에는 달력과 리포트로 흐름을 차분히 돌아볼 수 있어요.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              {live ? launchCopy.installCta : launchCopy.pendingCta}
            </Link>
          </div>
          <div className="mt-6 hidden justify-center sm:flex">
            <StoreButtons surface="hero" locale={locale} />
          </div>
        </div>
      </Container>
    </section>
  )
}
