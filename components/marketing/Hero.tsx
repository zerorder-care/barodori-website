import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[var(--color-bg-muted)] py-16 sm:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_516px]">
        <div>
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            우리 아이 홈케어 운동 기록
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl">
            오늘도 해냈다는
            <br />
            기록이 쌓이도록
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            오늘의 목표 운동을 정하고, 집에서 한 운동과 아이의 반응을 기록하면 목표 달성과 꾸준함이 한눈에 보여요. 바로도리는 막막한 홈케어가 매일의 작은 루틴이 되도록 곁에서 도와드립니다.
          </p>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)]">일단 켜고, 오늘의 홈케어부터</p>
          <div className="mt-8 flex flex-col sm:flex-row">
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              앱에서 시작하기
            </Link>
          </div>
          <div className="mt-6">
            <StoreButtons surface="hero" locale={locale} />
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative aspect-[760/1500] w-full max-w-[300px]">
            <Image
              src="/images/hero-phone.png"
              alt="바로도리에서 오늘 홈케어 운동을 기록하고 리포트를 확인하는 앱 화면"
              fill
              sizes="(max-width: 640px) 70vw, 300px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
