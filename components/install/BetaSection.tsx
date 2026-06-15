'use client'

import { Container } from '@/components/ui/Container'
import { track } from '@/lib/analytics'
import { getBetaFormUrl } from '@/lib/install/storeLinks'
import type { Locale } from '@/lib/i18n/config'

export function BetaSection({ locale }: { locale: Locale }) {
  const url = getBetaFormUrl()
  if (!url) return null
  const onClick = () => track('cta_beta_form_click', { surface: 'install_page', locale })
  return (
    <section className="bg-[var(--color-primary-light)] py-16">
      <Container className="text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">오픈 소식을 먼저 받아보세요</h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--color-text-secondary)]">
          스토어 오픈 전까지 베타/알림 신청으로 바로도리 소식을 먼저 받아보세요. 운영팀이 직접 확인하고 안내드릴게요.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="mt-6 inline-flex items-center justify-center rounded-pill bg-[var(--color-text-primary)] px-8 py-3 text-sm font-semibold text-white"
        >
          오픈 소식 받기 →
        </a>
      </Container>
    </section>
  )
}
