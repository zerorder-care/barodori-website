import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { isAppLive } from '@/lib/install/storeLinks'
import { launchCopy } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export function Hero({ locale }: { locale: Locale }) {
  const live = isAppLive()

  return (
    <section className="bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-muted)_48%,var(--color-primary-light)_78%,rgba(255,183,0,0.30)_100%)] py-8 sm:py-20">
      <Container className="flex flex-col items-center text-center">
        <div className="w-full">
          <h1 className="mt-5 whitespace-nowrap text-3xl font-bold leading-[1.18] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem]">
            일단 바로도리, 켜는 순간 홈케어 시작
          </h1>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)] sm:text-lg">
            막막한 홈케어를 바로도리와 함께해요
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
