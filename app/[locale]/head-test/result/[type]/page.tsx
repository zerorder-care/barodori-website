import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { TrackedLink } from '@/components/analytics/TrackedLink'
import { AppCta } from '@/components/head-test/AppCta'
import { MiniHeader } from '@/components/head-test/MiniHeader'
import { ResultTips } from '@/components/head-test/ResultTips'
import { ResultViewTracker } from '@/components/head-test/ResultViewTracker'
import { ShareButton } from '@/components/head-test/ShareButton'
import { headTypes, isHeadType } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'

// 결과 화면 — UX 스펙 §4.7의 8단 구성.
// 유형 카드 → 통계 → 특성 본문 → 놀이 팁 → 공유 → 앱 CTA → 병원 안내·면피 → 다시 해보기·다른 유형.
// 통계는 실측 집계가 붙기 전까지 표본 부족 폴백 문구를 쓰고, 공유 동작·계측은 공유 티켓에서 잇는다.

export function generateStaticParams() {
  return headTypes.map((type) => ({ type }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>
}) {
  const { locale, type } = await params
  if (!isLocale(locale) || !isHeadType(type)) return {}
  const dict = await getDictionary(locale)
  const typeCopy = dict.headTest.result.types[type]
  return buildMetadata({
    title: `${typeCopy.name} — ${dict.headTest.seo.title}`,
    description: typeCopy.oneLiner,
    path: `/${locale}/head-test/result/${type}`,
    locale,
    image: `/images/head-test/og/${type}.png`,
  })
}

export default async function HeadTestResultPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>
}) {
  const { locale, type } = await params
  if (!isLocale(locale)) notFound()
  const loc = locale as Locale
  // 잘못된 유형 주소는 막다른 화면 대신 테스트 입구로 보낸다 (UX 스펙 §1).
  if (!isHeadType(type)) redirect(`/${loc}/head-test`)
  const dict = await getDictionary(loc)
  const copy = dict.headTest
  const typeCopy = copy.result.types[type]

  return (
    <div className="flex flex-1 flex-col">
      <ResultViewTracker locale={loc} type={type} />
      <MiniHeader locale={loc} homeLabel={dict.common.home} />
      <div className="flex flex-1 flex-col items-center gap-8 px-6 pb-12 pt-4 text-center">
        {/* 1. 유형 카드 */}
        <section className="w-full rounded-3xl bg-[var(--color-primary-light)] px-6 py-10">
          <Image
            src={`/images/head-test/${type}.png`}
            alt={typeCopy.name}
            width={180}
            height={180}
            priority
            className="mx-auto"
          />
          <p className="mt-6 text-lg font-semibold">{copy.result.titlePrefix}</p>
          <h1 className="mt-1 text-4xl font-bold">{typeCopy.name}</h1>
          <p className="mt-4 text-[var(--color-text-secondary)]">{typeCopy.oneLiner}</p>
        </section>

        {/* 2. 통계 (실측 연동 전 폴백) */}
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          {copy.result.statsFallback.replace('{type}', typeCopy.name)}
        </p>

        {/* 3. 특성 본문 */}
        <section className="w-full rounded-2xl border border-[var(--color-border)] p-6 text-left">
          {typeCopy.traits.map((line) => (
            <p key={line} className="leading-relaxed [&+&]:mt-2">
              {line}
            </p>
          ))}
        </section>

        {/* 4. 놀이 팁 (월령 토글 + 방향 분기) */}
        <ResultTips type={type} copy={copy.result} />

        {/* 5. 공유 — 유형별 훅 + 공통 꼬리 문구 (공유 플로우 스펙 §2) */}
        <ShareButton
          locale={loc}
          type={type}
          label={copy.result.shareCta}
          copiedLabel={copy.result.shareCopied}
          shareText={`${copy.result.share.hooks[type]}\n${copy.result.share.tail}`}
        />

        {/* 6. 앱 CTA — 모바일은 스토어 직행 버튼, 데스크톱은 QR */}
        <AppCta
          locale={loc}
          type={type}
          head={copy.result.appCtaHead}
          sub={copy.result.appCtaSub}
          buttonLabel={copy.result.appCtaButton}
          storeLabels={dict.store}
        />

        {/* 7. 병원 안내 + 면피 — 접지 않고 항상 노출 */}
        <section className="w-full text-left text-xs leading-relaxed text-[var(--color-text-secondary)]">
          <p>{copy.result.disclaimer}</p>
          <p className="mt-2">{copy.result.hospital}</p>
        </section>

        {/* 8. 다시 해보기 + 다른 유형 구경 */}
        <section className="w-full">
          <TrackedLink
            href={`/${loc}/head-test`}
            event="head_test_retry_click"
            eventProps={{ locale: loc, from: type }}
            className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
          >
            {copy.result.retry}
          </TrackedLink>
          <h2 className="mt-8 text-sm font-bold text-[var(--color-text-secondary)]">
            {copy.result.othersTitle}
          </h2>
          <ul className="mt-3 flex justify-center gap-1">
            {headTypes.map((other) => (
              <li key={other}>
                <TrackedLink
                  href={`/${loc}/head-test/result/${other}`}
                  event="head_test_other_type_click"
                  eventProps={{ locale: loc, from: type, to: other }}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2 ${
                    other === type ? 'bg-[var(--color-primary-light)]' : 'hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  <Image
                    src={`/images/head-test/${other}.png`}
                    alt=""
                    aria-hidden
                    width={52}
                    height={52}
                  />
                  <span className="text-xs font-semibold">{copy.result.types[other].name}</span>
                </TrackedLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
