'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import { resolveResultEntry } from '@/lib/head-test/share'
import { readCompletedType } from '@/lib/head-test/storage'
import type { HeadType } from '@/lib/head-test/types'
import type { Locale } from '@/lib/i18n/config'

/** 결과 화면 노출 계측 — 자기 결과·공유 유입·직접 진입을 구분한다 (공유 플로우 스펙 §4). */
export function ResultViewTracker({ locale, type }: { locale: Locale; type: HeadType }) {
  useEffect(() => {
    const entry = resolveResultEntry(window.location.search, readCompletedType(), type)
    track('head_test_result_view', { locale, type, entry })
  }, [locale, type])

  return null
}
