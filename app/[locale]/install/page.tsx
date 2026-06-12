import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { BetaSection } from '@/components/install/BetaSection'
import { isAppLive } from '@/lib/install/storeLinks'
import { launchCopy } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return buildMetadata({
    title: '바로도리 앱 시작하기 - 아기 운동 기록',
    description: '바로도리 앱에서 오늘의 아기 운동 기록과 영유아 홈케어 루틴을 달력과 리포트로 다시 확인해보세요.',
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
          <p className="inline-flex rounded-pill bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
            {launchCopy.appStatusLabel}
          </p>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">바로도리 앱 시작하기</h1>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {live
              ? '스토어에서 바로도리를 설치하고 오늘의 홈케어 운동부터 기록해보세요.'
              : '스토어 오픈 전까지 베타/알림 신청으로 바로도리 소식을 먼저 받아보세요.'}
          </p>
          <div className="mt-8 flex justify-center">
            <StoreButtons surface="install_page" locale={loc} />
          </div>
          {!live && (
            <div
              id="coming-soon"
              className="mx-auto mt-10 max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-5 text-sm text-[var(--color-text-secondary)]"
            >
              QR 코드와 스토어 링크는 앱 오픈 상태에 맞춰 제공됩니다.
            </div>
          )}
        </Container>
      </section>
      <BetaSection locale={loc} />
    </>
  )
}
