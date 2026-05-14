import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { BetaSection } from '@/components/install/BetaSection'
import { isAppLive } from '@/lib/install/storeLinks'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '바로도리 앱 설치',
    description: 'iOS, Android에서 바로도리를 만나보세요',
    path: `/${locale}/install`,
    locale,
  })
}

export default async function InstallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  const live = isAppLive()
  return (
    <>
      <section className="py-16">
        <Container className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">바로도리 앱 설치</h1>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {live
              ? '앱스토어에서 바로 다운로드하세요.'
              : '2026년 6월 1일 정식 출시 예정입니다. 베타 서포터즈로 먼저 만나보세요.'}
          </p>
          <div className="mt-8 flex justify-center">
            <StoreButtons surface="install_page" locale={loc} />
          </div>
          {!live && (
            <div
              id="coming-soon"
              className="mx-auto mt-10 max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-5 text-sm text-[var(--color-text-secondary)]"
            >
              QR 코드 / 스토어 링크는 정식 출시 시 활성화됩니다.
            </div>
          )}
        </Container>
      </section>
      <BetaSection locale={loc} />
    </>
  )
}
