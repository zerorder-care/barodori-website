'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

export function ArticleViewTracker({
  contentId,
  category,
  locale,
}: {
  contentId: string
  category: string
  locale: Locale
}) {
  useEffect(() => {
    track('article_view', { contentId, category, locale })
  }, [contentId, category, locale])
  return null
}
