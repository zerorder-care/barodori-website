import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getDictionary, isLocale } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { MiniHeader } from '@/components/head-test/MiniHeader'
import { headTypes, isHeadType } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'

// 결과 화면 골격 — 유형 카드와 다시 해보기만 둔다.
// 통계·특성 본문·놀이 팁·공유·앱 CTA·유형별 OG 메타는 결과 화면 티켓에서 이어서 구현한다.

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
    description: dict.headTest.seo.description,
    path: `/${locale}/head-test/result/${type}`,
    locale,
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
      <MiniHeader locale={loc} homeLabel={dict.common.home} />
      <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-6 text-center">
        <div className="w-full rounded-3xl bg-[var(--color-primary-light)] px-6 py-10">
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
        </div>
        <Link
          href={`/${loc}/head-test`}
          className="mt-8 text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
        >
          {copy.result.retry}
        </Link>
      </div>
    </div>
  )
}
