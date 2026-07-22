import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { StoreQrCodes } from '@/components/install/StoreQrCodes'
import { isAppLive } from '@/lib/install/storeLinks'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function Hero({ locale }: { locale: Locale }) {
  const live = isAppLive()
  const dict = await getDictionary(locale)

  return (
    <section className="bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-muted)_48%,var(--color-primary-light)_78%,rgba(255,183,0,0.30)_100%)] py-8 sm:py-20">
      <Container className="flex flex-col items-center text-center">
        <div className="w-full">
          <h1 className="mt-5 text-3xl font-bold leading-[1.18] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem]">
            <span className="block sm:inline">{dict.home.hero.titlePrimary}</span>
            {' '}
            <span className="block sm:inline">{dict.home.hero.titleSecondary}</span>
          </h1>
          <p className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)] sm:text-lg">
            {dict.home.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/install`}
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
            >
              {live ? dict.launch.installCta : dict.launch.pendingCta}
            </Link>
          </div>
          {live && (
            <div className="mt-8 hidden justify-center sm:flex">
              <StoreQrCodes surface="hero" locale={locale} labels={dict.store} />
            </div>
          )}
          <div className="mt-6 hidden justify-center sm:flex">
            <StoreButtons surface="hero" locale={locale} labels={dict.store} />
          </div>
        </div>
      </Container>
    </section>
  )
}
