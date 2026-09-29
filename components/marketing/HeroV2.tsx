import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

type HeroCopy = Dictionary['home']['hero']

export function HeroV2({ locale, copy }: { locale: Locale; copy: HeroCopy }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-cream-top)_0%,#FFF9EB_55%,var(--color-bg)_100%)]"
    >
      <Container className="relative z-10 flex flex-col items-center pt-14 text-center sm:pt-20">
        <p className="rounded-pill bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-hero-fg)] shadow-[0_0_5px_rgba(0,0,0,0.05)]">
          {copy.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="mt-5 text-[34px] font-bold leading-[1.18] tracking-[-1px] text-[var(--color-gray-900)] sm:text-5xl lg:text-[54px]"
        >
          <span className="block">{copy.titleLead}</span>{' '}
          <span className="block">
            {copy.titleTail} <span className="text-[var(--color-orange-700)]">{copy.titleAccent}</span>
          </span>
        </h1>
        <p className="mt-5 text-base font-medium leading-relaxed text-[var(--color-gray-600)] sm:text-lg lg:text-[19px]">
          {copy.body}
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <TrackedLink
            href={`/${locale}/install`}
            event="cta_install_click"
            eventProps={{ surface: 'hero', platform: 'install_page', locale }}
            className="inline-flex h-14 items-center justify-center rounded-[14px] bg-[var(--color-orange-500)] px-7 text-[17px] font-bold text-[var(--color-gray-900)]"
          >
            {copy.ctaPrimary}
          </TrackedLink>
          <TrackedLink
            href={`/${locale}/head-test`}
            event="head_test_entry_click"
            eventProps={{ surface: 'hero_secondary', locale }}
            className="inline-flex h-14 items-center justify-center rounded-[14px] bg-[var(--color-orange-100)] px-7 text-[17px] font-bold text-[var(--color-hero-fg)]"
          >
            {copy.ctaSecondary}
          </TrackedLink>
        </div>
        <p className="mt-4 text-[13px] font-medium text-[var(--color-gray-500)]">{copy.trust}</p>
      </Container>

      <div className="relative mx-auto mt-8 h-[300px] w-full max-w-[1056px] sm:h-[360px]">
        <PhoneFrame
          src="/images/home-v2/screen-weekly.png"
          alt={copy.screens.weekly}
          tall
          className="absolute bottom-[-190px] left-[calc(50%-330px)] hidden w-[230px] -rotate-[7deg] sm:block"
        />
        <PhoneFrame
          src="/images/home-v2/screen-home.png"
          alt={copy.screens.home}
          preload
          className="absolute bottom-[-150px] left-1/2 z-10 w-[200px] -translate-x-1/2 sm:bottom-[-140px] sm:w-[250px]"
        />
        <PhoneFrame
          src="/images/home-v2/screen-head-report.png"
          alt={copy.screens.headReport}
          className="absolute bottom-[-190px] left-[calc(50%+100px)] hidden w-[230px] rotate-[7deg] sm:block"
        />
        <Image
          src="/images/home-v2/dori-cheer.png"
          alt=""
          role="presentation"
          width={800}
          height={600}
          sizes="(max-width: 640px) 120px, 210px"
          className="absolute bottom-2 left-[-10px] z-20 w-[120px] sm:left-12 sm:bottom-6 sm:w-[210px]"
        />
        <Image
          src="/images/home-v2/baby-celebrate.png"
          alt=""
          role="presentation"
          width={791}
          height={800}
          sizes="230px"
          className="absolute bottom-0 right-12 z-20 hidden w-[230px] sm:block"
        />
      </div>
    </section>
  )
}
