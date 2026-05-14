import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[var(--color-bg-muted)] py-16 sm:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1fr_516px]">
        <div>
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
            Hero · 메인 영역
          </p>
          <p className="mt-8 text-sm text-[var(--color-text-secondary)]">영유아 사경 · 사두 가정 관리 보조 앱</p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl">
            아이의 변화를 차분하게 살피고,
            <br />
            보호자는 더 쉽게 이어가도록
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            보호자 경험을 바탕으로 만든 가정 관리 보조 앱으로 아이의 상태 변화를 기록하고, 상황에 맞는 운동 루틴을 참고해보세요.
          </p>
          <div className="mt-8">
            <StoreButtons surface="hero" locale={locale} />
          </div>
          <p className="mt-5 text-xs text-[var(--color-text-secondary)]">* 현재 베타 운영중 · 정식 출시 2026.6.1 예정</p>
        </div>
        <div className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white p-6 shadow-sm lg:min-h-[500px]">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[var(--color-primary-light)]" />
          <div className="relative aspect-[760/1500] w-full max-w-[300px]">
            <Image
              src="/images/hero-phone.png"
              alt="바로도리 앱 화면"
              fill
              sizes="(max-width: 640px) 70vw, 300px"
              className="object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.18)]"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
