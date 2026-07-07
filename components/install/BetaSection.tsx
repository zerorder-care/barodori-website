import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { isAppLive } from '@/lib/install/storeLinks'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export async function BetaSection({ locale }: { locale: Locale }) {
  if (!isAppLive()) return null
  const dict = await getDictionary(locale)
  return (
    <section className="bg-[var(--color-primary-light)] py-16">
      <Container className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">{dict.install.downloadTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--color-text-secondary)]">
          {dict.install.downloadBody}
        </p>
        <div className="mt-6 flex justify-center">
          <StoreButtons surface="install_page_bottom" locale={locale} labels={dict.store} />
        </div>
      </Container>
    </section>
  )
}
