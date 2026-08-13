import type { HeadType } from './types'
import type { Locale } from '@/lib/i18n/config'

// 공유 링크와 결과 화면 진입 구분 (공유 플로우 스펙 §3).
// 공유 URL에는 유형 슬러그와 UTM 외의 어떤 정보도 싣지 않는다.

export const SHARE_UTM = 'utm_source=head_test&utm_medium=share'
export const APP_CTA_UTM = 'utm_source=head_test&utm_medium=result_cta'

// 결과 화면의 앱 진입은 MMP(에어브리지) 트래킹 링크를 쓴다. 링크가 기기별 스토어
// 라우팅과 설치 어트리뷰션을 대신하므로 클라이언트에서 플랫폼을 가르지 않는다.
// 본사이트(홈·설치 페이지)의 스토어 링크는 이 링크를 쓰지 않는다.
const DEFAULT_APP_LINK = 'https://abr.ge/76hjm6'

export function appLinkUrl(): string {
  return process.env.NEXT_PUBLIC_HEAD_TEST_APP_LINK ?? DEFAULT_APP_LINK
}

export function sharePathFor(locale: Locale, type: HeadType): string {
  return `/${locale}/head-test/result/${type}?${SHARE_UTM}`
}

export type ResultEntry = 'own' | 'share' | 'direct'

/**
 * 결과 화면 진입 구분: utm_medium=share가 있으면 공유 유입,
 * 이 기기에서 같은 유형으로 테스트를 마친 기록이 있으면 자기 결과, 그 외는 직접 진입.
 */
export function resolveResultEntry(
  search: string,
  completedType: string | null,
  type: HeadType,
): ResultEntry {
  const params = new URLSearchParams(search)
  if (params.get('utm_medium') === 'share') return 'share'
  if (completedType === type) return 'own'
  return 'direct'
}

/** 인트로 노출 이벤트의 source: utm_medium 값이 있으면 그 값, 없으면 direct. */
export function resolveViewSource(search: string): string {
  return new URLSearchParams(search).get('utm_medium') ?? 'direct'
}
