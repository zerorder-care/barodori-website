import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { StoreQrCodes } from '@/components/install/StoreQrCodes'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  const dict = await getDictionary(locale)

  return (
    <section
      aria-labelledby="install-cta-title"
      className="bg-[linear-gradient(180deg,var(--color-orange-50)_0%,var(--color-bg)_100%)] py-24"
    >
      <Container className="flex flex-col items-center text-center">
        <h2
          id="install-cta-title"
          className="max-w-2xl text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl"
        >
          {dict.home.installCta.title}
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-gray-600)]">
          {dict.home.installCta.body}
        </p>
        <div className="mt-8">
          <StoreButtons surface={surface} locale={locale} labels={dict.store} />
        </div>
        <StoreQrCodes surface={surface} locale={locale} labels={dict.store} className="mt-10 hidden sm:flex" />
        <p className="mt-5 text-xs text-[var(--color-gray-500)]">{dict.launch.liveNotice}</p>
      </Container>
    </section>
  )
}
