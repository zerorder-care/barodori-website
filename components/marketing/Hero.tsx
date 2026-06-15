import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[var(--color-bg-muted)] py-8 sm:py-20">
      <Container className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[1fr_516px] lg:gap-12">
        <div>
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            사경 진단 이후 홈케어 기록
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl">
            병원 다음 홈케어가
            <br />
            기록으로 이어지게
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            물리치료를 받고 온 뒤, 집에서 할 운동 목표를 세우고 기록하세요. 바로도리는 기록을 리포트로
            정리해 꾸준함을 확인하게 돕습니다.
          </p>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)]">
            치료 판단이 아닌, 홈케어 기록과 추적을 위한 서비스
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              오늘 목표 기록하기
            </Link>
            <Link
              href="#homecare-loop"
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[var(--color-text-primary)] px-6 text-sm font-bold"
            >
              기록 방식 보기
            </Link>
          </div>
          <div className="mt-6 hidden sm:block">
            <StoreButtons surface="hero" locale={locale} />
          </div>
        </div>
        <div className="hidden justify-center sm:flex lg:justify-end">
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
