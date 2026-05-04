import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { LocaleSwitcher } from './LocaleSwitcher'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export async function Header({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  return (
    <header className="sticky top-0 z-40 border-b border-[--color-border] bg-white/90 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href={`/${locale}`} className="text-base font-bold">
          {dict.common.appName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <Link href={`/${locale}/product`}>{dict.nav.product}</Link>
          <Link href={`/${locale}/articles`}>{dict.nav.articles}</Link>
          <Link href={`/${locale}/install`} className="font-semibold text-[--color-primary-dark]">
            {dict.nav.install}
          </Link>
        </nav>
        <LocaleSwitcher current={locale} />
      </Container>
    </header>
  )
}
