import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/marketing/Reveal'
import { SectionHeading } from '@/components/marketing/SectionHeading'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

type PricingCopy = Dictionary['home']['pricing']

export function PricingSection({ locale, copy }: { locale: Locale; copy: PricingCopy }) {
  // 금액이 확정된 언어에서만 가격 카드를 보여준다.
  const hasAmounts = Boolean(copy.yearly.total && copy.monthly.price)

  return (
    <section
      aria-labelledby="pricing-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-cream-top)_0%,#FFF9EB_60%,var(--color-bg)_100%)] py-20 sm:py-28"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <SectionHeading id="pricing-title" label={copy.label} title={copy.title} pill="white" />
          <p className="mt-5 text-base font-medium leading-[1.55] text-[var(--color-gray-600)] sm:text-lg">
            {copy.body}
          </p>

          {hasAmounts && (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              <li className="relative rounded-[16px] border-2 border-[var(--color-orange-500)] bg-[var(--color-orange-50)] p-5">
                <p className="text-sm font-semibold text-[var(--color-gray-900)]">{copy.yearly.name}</p>
                {/* 읽어 주는 차례를 요금제 이름 다음으로 두고, 보이는 자리만 카드 위쪽으로 띄운다. */}
                <span className="absolute -top-3 left-4 rounded-pill bg-[var(--color-orange-900)] px-3 py-1 text-xs font-bold text-white">
                  {copy.yearly.badge}
                </span>
                <p className="mt-2 text-[28px] font-bold tabular-nums leading-none text-[var(--color-gray-900)]">
                  {copy.yearly.monthlyEquivalent}
                </p>
                <p className="mt-2 text-[13px] text-[var(--color-gray-600)]">{copy.yearly.total}</p>
              </li>
              <li className="rounded-[16px] border border-[var(--color-gray-200)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-gray-900)]">{copy.monthly.name}</p>
                <p className="mt-2 text-[28px] font-bold tabular-nums leading-none text-[var(--color-gray-900)]">
                  {copy.monthly.price}
                </p>
                <p className="mt-2 text-[13px] text-[var(--color-gray-600)]">{copy.monthly.total}</p>
              </li>
            </ul>
          )}

          <ul className="mt-5 space-y-1 text-[13px] font-medium text-[var(--color-gray-500)]">
            {copy.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>

          <TrackedLink
            href={`/${locale}/install`}
            event="cta_install_click"
            eventProps={{ surface: 'pricing', locale, live: true }}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-[12px] bg-[var(--color-orange-500)] px-6 text-[15px] font-bold text-[var(--color-gray-900)]"
          >
            {copy.cta}
          </TrackedLink>
        </Reveal>
        <Reveal delayMs={120} className="relative hidden h-[360px] lg:block">
          <Image
            src="/images/home-v2/dori-cheer.png"
            alt=""
            role="presentation"
            width={800}
            height={600}
            sizes="220px"
            className="absolute bottom-0 left-0 w-[220px]"
          />
          <Image
            src="/images/home-v2/baby-celebrate.png"
            alt=""
            role="presentation"
            width={791}
            height={800}
            sizes="300px"
            className="absolute bottom-0 right-0 w-[300px]"
          />
        </Reveal>
      </Container>
    </section>
  )
}
