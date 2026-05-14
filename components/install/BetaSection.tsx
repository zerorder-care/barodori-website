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
        <h2 className="text-2xl font-bold sm:text-3xl">베타 서포터즈가 되어주세요</h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--color-text-secondary)]">
          정식 출시 전, 바로도리를 먼저 사용하고 피드백을 남겨줄 보호자를 모집합니다. 운영팀이 직접 답변드립니다.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="mt-6 inline-flex items-center justify-center rounded-pill bg-black px-8 py-3 text-sm font-semibold text-white"
        >
          구글폼으로 신청하기 →
        </a>
      </Container>
    </section>
  )
}
