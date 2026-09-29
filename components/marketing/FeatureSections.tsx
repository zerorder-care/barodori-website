import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { PhoneFrame } from '@/components/marketing/PhoneFrame'
import { Reveal } from '@/components/marketing/Reveal'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

type FeatureCopy = Dictionary['home']['features'][number]

type FeatureMeta = {
  id: string
  screen: string
  tall: boolean
  /** 폰을 왼쪽에 두고 글을 오른쪽에 둔다. */
  reverse: boolean
  bg: string
  /** 운동 섹션에만 놀이매트와 아기 캐릭터 장식을 깐다. */
  playmat: boolean
  linkSurface: string
}

const META: readonly FeatureMeta[] = [
  {
    id: 'record',
    screen: '/images/home-v2/screen-record.png',
    tall: false,
    reverse: false,
    bg: 'bg-white',
    playmat: false,
    linkSurface: '',
  },
  {
    id: 'exercise',
    screen: '/images/home-v2/screen-exercise.png',
    tall: false,
    reverse: true,
    bg: 'bg-[var(--color-orange-50)]',
    playmat: true,
    linkSurface: '',
  },
  {
    id: 'weekly',
    screen: '/images/home-v2/screen-weekly.png',
    tall: true,
    reverse: false,
    bg: 'bg-white',
    playmat: false,
    linkSurface: '',
  },
  {
    id: 'headReport',
    screen: '/images/home-v2/screen-head-report.png',
    tall: false,
    reverse: true,
    bg: 'bg-[var(--color-orange-50)]',
    playmat: false,
    linkSurface: 'feature_head_report',
  },
]

export function FeatureSections({
  locale,
  features,
}: {
  locale: Locale
  features: readonly FeatureCopy[]
}) {
  return (
    <>
      {features.map((feature, index) => {
        const meta = META.find((m) => m.id === feature.id) ?? META[index] ?? META[0]
        const titleId = `feature-${feature.id}-title`
        // 섹션 바탕이 주황이면 라벨은 흰색으로 띄워 대비를 지킨다.
        const pillBg = meta.bg === 'bg-white' ? 'bg-[var(--color-orange-50)]' : 'bg-white'
        return (
          <section key={feature.id} aria-labelledby={titleId} className={`${meta.bg} py-20 sm:py-28`}>
            <Container>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  meta.reverse ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Reveal>
                  <p
                    className={`inline-flex rounded-pill ${pillBg} px-3 py-1.5 text-[13px] font-semibold leading-[1.3] text-[var(--color-hero-fg)]`}
                  >
                    {feature.label}
                  </p>
                  <h2
                    id={titleId}
                    className="mt-4 text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-[var(--color-gray-900)] sm:text-4xl lg:text-[40px]"
                  >
                    {feature.title}
                  </h2>
                  <p className="mt-5 text-base font-medium leading-[1.55] text-[var(--color-gray-600)] sm:text-lg lg:text-[19px]">
                    {feature.body}
                  </p>
                  {feature.note && (
                    <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-gray-500)]">{feature.note}</p>
                  )}
                  {feature.link && (
                    <TrackedLink
                      href={`/${locale}/head-test`}
                      event="head_test_entry_click"
                      eventProps={{ surface: meta.linkSurface, locale }}
                      className="mt-6 inline-block border-b-2 border-[var(--color-orange-300)] pb-0.5 text-[15px] font-semibold text-[var(--color-gray-900)]"
                    >
                      {feature.link}
                    </TrackedLink>
                  )}
                </Reveal>
                <Reveal delayMs={120} className="relative">
                  {meta.playmat && (
                    <>
                      <Image
                        src="/images/home-v2/playmat.png"
                        alt=""
                        role="presentation"
                        width={630}
                        height={900}
                        sizes="420px"
                        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-[420px] opacity-40"
                      />
                      <Image
                        src="/images/home-v2/baby-stand.png"
                        alt=""
                        role="presentation"
                        width={956}
                        height={1200}
                        sizes="150px"
                        className="pointer-events-none absolute bottom-0 right-2 hidden w-[150px] lg:block"
                      />
                    </>
                  )}
                  <PhoneFrame src={meta.screen} alt={feature.screenAlt} tall={meta.tall} className="relative" />
                </Reveal>
              </div>
            </Container>
          </section>
        )
      })}
    </>
  )
}
