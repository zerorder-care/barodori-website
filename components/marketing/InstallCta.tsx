import { Container } from '@/components/ui/Container'
import { StoreButtons } from '@/components/install/StoreButtons'
import { isAppLive } from '@/lib/install/storeLinks'
import { getExternalLinks, launchCopy } from '@/lib/site/config'
import type { Locale } from '@/lib/i18n/config'

export function InstallCta({ locale, surface }: { locale: Locale; surface: string }) {
  const live = isAppLive()
  const betaForm = getExternalLinks().betaForm
  const notice = live ? launchCopy.liveNotice : launchCopy.pendingNotice

  return (
    <section className="bg-[#111827] py-24 text-white">
      <Container className="flex flex-col items-center text-center">
        <p className="rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          목표 · 기록 · 리포트
        </p>
        <h2 className="mt-8 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          오늘의 홈케어 기록을 놓치지 않도록
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70">
          병원에서 안내받은 운동을 집에서 이어가고, 시간·횟수·아이 반응을 달력과 리포트로 다시 확인하세요.
        </p>
        <div className="mt-8">
          <StoreButtons surface={surface} locale={locale} />
        </div>
        {!live && (
          <a
            href={betaForm ?? `/${locale}/install`}
            target={betaForm ? '_blank' : undefined}
            rel={betaForm ? 'noopener noreferrer' : undefined}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-6 text-sm font-bold text-[var(--color-text-primary)]"
          >
            {launchCopy.pendingCta}
          </a>
        )}
        <p className="mt-5 text-xs text-white/50">{notice}</p>
      </Container>
    </section>
  )
}
