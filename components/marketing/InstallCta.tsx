import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { StoreQrCodes } from '@/components/install/StoreQrCodes'
import { isAppLive } from '@/lib/install/storeLinks'
import { getDictionary } from '@/lib/i18n/dictionary'
import { getExternalLinks } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export async function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  const live = isAppLive()
  const betaForm = getExternalLinks().betaForm
  const dict = await getDictionary(locale)
  const notice = live ? dict.launch.liveNotice : dict.launch.pendingNotice

  return (
    <section className="bg-[#111827] py-24 text-white">
      <Container className="flex flex-col items-center text-center">
        <p className="rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          {dict.home.installCta.eyebrow}
        </p>
        <h2 className="mt-8 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          {dict.home.installCta.title}
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70">
          {dict.home.installCta.body}
        </p>
        <div className="mt-8">
          <StoreButtons surface={surface} locale={locale} labels={dict.store} />
        </div>
        {live && (
          <div className="mt-10 hidden justify-center sm:flex">
            <StoreQrCodes surface={surface} locale={locale} labels={dict.store} tone="dark" />
          </div>
        )}
        {!live && (
          <a
            href={betaForm ?? `/${locale}/install`}
            target={betaForm ? '_blank' : undefined}
            rel={betaForm ? 'noopener noreferrer' : undefined}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
          >
            {dict.launch.pendingCta}
          </a>
        )}
        <p className="mt-5 text-xs text-white/50">{notice}</p>
      </Container>
    </section>
  )
}
