import { notFound } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { Container } from '@/components/ui/Container'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    ...buildMetadata({
      title: dict.legal.termsTitle,
      description: dict.legal.termsDescription,
      path: `/${locale}/legal/terms`,
      locale,
    }),
    robots: { index: false, follow: false },
  }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">{dict.legal.termsTitle}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.legal.effectiveDateDraft}</p>
      <div className="mt-8 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-muted)] p-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {dict.legal.draftBody}
      </div>
    </Container>
  )
}
