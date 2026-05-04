'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n/config'

export function ArticleViewTracker({ slug, category, locale }: { slug: string; category: string; locale: Locale }) {
  useEffect(() => {
    track('article_view', { slug, category, locale })
  }, [slug, category, locale])
  return null
}
