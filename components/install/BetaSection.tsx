'use client'

import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { isAppLive } from '@/lib/install/storeLinks'
import type { Locale } from '@/lib/i18n/config'

export function BetaSection({ locale }: { locale: Locale }) {
  if (!isAppLive()) return null
  return (
    <section className="bg-[var(--color-primary-light)] py-16">
      <Container className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">지금 바로도리를 다운로드하세요</h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--color-text-secondary)]">
          iOS와 Android에서 바로도리를 설치하고 오늘의 홈케어 기록을 시작하세요.
        </p>
        <div className="mt-6 flex justify-center">
          <StoreButtons surface="install_page_bottom" locale={locale} />
        </div>
      </Container>
    </section>
  )
}
