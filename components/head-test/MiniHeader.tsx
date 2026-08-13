import Link from 'next/link'
import { BarodoriMark } from '@/components/layout/BarodoriMark'
import type { Locale } from '@/lib/i18n/config'

/** 테스트 화면 전용 최소 헤더 — 소형 로고 홈 링크만 둔다 (UX 스펙 §2). */
export function MiniHeader({ locale, homeLabel }: { locale: Locale; homeLabel: string }) {
  return (
    <div className="flex h-14 items-center px-5">
      <Link href={`/${locale}`} aria-label={homeLabel} className="inline-flex items-center">
        <BarodoriMark className="h-7 w-7" />
      </Link>
    </div>
  )
}
