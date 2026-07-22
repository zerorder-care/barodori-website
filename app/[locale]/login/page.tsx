import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SocialLoginPanel } from '@/components/auth/SocialLoginPanel'
import { Container } from '@/components/ui/Container'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'
import { buildMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return buildMetadata({
    title: dict.login.seo.title,
    description: dict.login.seo.description,
    path: `/${locale}/login`,
    locale,
  })
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const dict = await getDictionary(loc)
  const search = await searchParams
  const nextPath = normalizeNextPath(search.next, locale)

  return (
    <section className="bg-[var(--color-bg-muted)] py-20">
      <Container>
        <div className="mx-auto max-w-md rounded-[8px] border border-[var(--color-border)] bg-white p-8">
          <p className="inline-flex rounded-pill bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
            {dict.login.eyebrow}
          </p>
          <h1 className="mt-5 text-3xl font-bold">{dict.login.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {dict.login.description}
          </p>
          <SocialLoginPanel locale={loc} nextPath={nextPath} initialError={search.error} labels={dict.login} />
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {dict.login.agreementPrefix}{' '}
            <Link href={`/${locale}/legal/terms`} className="font-semibold underline">
              {dict.footer.terms}
            </Link>
            {' '}{dict.login.agreementMiddle}{' '}
            <Link href={`/${locale}/legal/privacy`} className="font-semibold underline">
              {dict.footer.privacy}
            </Link>
            {dict.login.agreementSuffix}
          </p>
        </div>
      </Container>
    </section>
  )
}

function normalizeNextPath(value: string | undefined, locale: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return `/${locale}/mypage`
  return value
}
