import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata, TORTICOLLIS_KEYWORDS } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { StoreQrCodes } from '@/components/install/StoreQrCodes'
import { BetaSection } from '@/components/install/BetaSection'
import { isAppLive } from '@/lib/install/storeLinks'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.install.seo.title,
    description: dict.install.seo.description,
    path: `/${locale}/install`,
    locale,
    keywords: locale === 'ko' ? TORTICOLLIS_KEYWORDS : undefined,
  })
}

export default async function InstallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const dict = await getDictionary(loc)
  const live = isAppLive()
  return (
    <>
      <section className="py-16">
        <Container className="text-center">
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            {dict.launch.appStatusLabel}
          </p>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">{dict.install.title}</h1>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {live ? dict.install.liveBody : dict.install.pendingBody}
          </p>
          <div className="mt-8 flex justify-center">
            <StoreButtons surface="install_page" locale={loc} labels={dict.store} />
          </div>
          {live && (
            <div className="mt-10 hidden justify-center sm:flex">
              <StoreQrCodes surface="install_page" locale={loc} labels={dict.store} />
            </div>
          )}
          {!live && (
            <div
              id="coming-soon"
              className="mx-auto mt-10 max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-5 text-sm text-[var(--color-text-secondary)]"
            >
              {dict.install.pendingBox}
            </div>
          )}
        </Container>
      </section>
      <BetaSection locale={loc} />
    </>
  )
}
