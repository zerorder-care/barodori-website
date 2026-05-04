import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { QrInstallModal } from '@/components/install/QrInstallModal'
import { StoreButtons } from '@/components/install/StoreButtons'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section className="bg-[--color-primary-light] py-16 sm:py-20">
      <Container className="grid items-center gap-10 sm:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            아기의 작은 고개,
            <br />
            바로도리에서 함께 살펴봐요
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[--color-text-secondary]">
            영아 사경/사두 의심부터 가정 케어까지. 보호자를 위한 신뢰 기반 가이드.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hidden sm:block">
              <QrInstallModal surface="hero" locale={locale}>
                지금 시작하기
              </QrInstallModal>
            </div>
            <div className="sm:hidden">
              <StoreButtons surface="hero" locale={locale} />
            </div>
          </div>
        </div>
        <div className="relative aspect-[3/4] w-full max-w-xs sm:ml-auto">
          <Image
            src="/images/hero-app.png"
            alt="바로도리 앱 화면"
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-contain"
            priority
          />
        </div>
      </Container>
    </section>
  )
}
