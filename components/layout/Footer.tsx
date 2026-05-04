import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export async function Footer({ locale }: { locale: Locale }) {
  const dict = await getDictionary(locale)
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 border-t border-[--color-border] bg-[--color-bg-muted] py-10 text-sm text-[--color-text-secondary]">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>{dict.footer.copyright.replace('{year}', String(year))}</p>
        <nav className="flex gap-4">
          <Link href={`/${locale}/legal/privacy`}>{dict.footer.privacy}</Link>
          <Link href={`/${locale}/legal/terms`}>{dict.footer.terms}</Link>
        </nav>
      </Container>
    </footer>
  )
}
