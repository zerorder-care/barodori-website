import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="py-8 sm:py-20">
      <Container className="flex flex-col items-center text-center">
        <div className="max-w-2xl">
          <h1 className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl">
            우리아이와 함께 꾸준히
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            아이의 상태를 기록을 기록하고 케어해요
          </p>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)]">
            홈케어 기록과 추적을 위한 서비스 바로도리를 만나보세요
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              목표한 운동 하러가기
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
