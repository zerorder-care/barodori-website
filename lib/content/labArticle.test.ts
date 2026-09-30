import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  exerciseContent,
  faqContent,
  headShapeLabCards,
  legacyBlocksContent,
  monthlyCards,
  monthlyContent,
} from '@/lib/api/__fixtures__/knowledgeLab'
import {
  blocksToDocument,
  documentText,
  estimateReadingMinutes,
  formatPublishedDate,
  matchesQuery,
  monthLabel,
  resolveCategory,
  resolveExcerpt,
  resolveTrack,
  splitTitle,
  stripMarkdown,
  toLabArticle,
  toLabArticleCard,
  truncate,
} from './labArticle'

const originalApiBaseUrl = process.env.BARODORI_API_BASE_URL

beforeAll(() => {
  process.env.BARODORI_API_BASE_URL = 'https://api.test'
})

afterAll(() => {
  if (originalApiBaseUrl === undefined) delete process.env.BARODORI_API_BASE_URL
  else process.env.BARODORI_API_BASE_URL = originalApiBaseUrl
})

/** 짝을 이룬 서러게이트를 지운 뒤에도 서러게이트가 남으면 글자가 반으로 갈린 것이다. */
function hasLoneSurrogate(text: string): boolean {
  return /[\uD800-\uDFFF]/.test(text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ''))
}

const monthLabels = {
  monthRange: '{min}개월',
  monthRangeSpan: '{min}개월부터 {max}개월',
  monthPlus: '13개월 이상',
}

describe('splitTitle', () => {
  it('splits a title that carries a parenthesised subtitle', () => {
    expect(splitTitle('도리도리 운동 따라 하기(부제: 하루 세 번 3분이면 충분해요)')).toEqual({
      title: '도리도리 운동 따라 하기',
      subtitle: '하루 세 번 3분이면 충분해요',
    })
  })

  it('accepts a space before the opening parenthesis', () => {
    expect(splitTitle('사두증이란 (부제: 머리 뒤가 납작할 때)')).toEqual({
      title: '사두증이란',
      subtitle: '머리 뒤가 납작할 때',
    })
  })

  it('keeps parentheses that sit inside the subtitle', () => {
    expect(splitTitle('제목(부제: 설명 (참고))')).toEqual({
      title: '제목',
      subtitle: '설명 (참고)',
    })
  })

  it('leaves a trailing parenthesis that is not a subtitle in the title', () => {
    expect(splitTitle('사두증이란(머리 뒤가 납작할 때)')).toEqual({
      title: '사두증이란(머리 뒤가 납작할 때)',
      subtitle: null,
    })
    expect(splitTitle('사두증이란()')).toEqual({ title: '사두증이란()', subtitle: null })
  })

  it('returns a null subtitle when there is no parenthesis', () => {
    expect(splitTitle('사두증이란')).toEqual({ title: '사두증이란', subtitle: null })
  })

  it('returns a null subtitle when the labelled parenthesis is empty', () => {
    expect(splitTitle('사두증이란(부제: )')).toEqual({ title: '사두증이란', subtitle: null })
  })

  it('leaves an unbalanced parenthesis alone', () => {
    expect(splitTitle('사두증이란 부제: 머리 뒤가 납작할 때)')).toEqual({
      title: '사두증이란 부제: 머리 뒤가 납작할 때)',
      subtitle: null,
    })
  })
})

describe('resolveCategory', () => {
  it('maps the monthly collection before looking at the kind', () => {
    expect(resolveCategory('home_monthly_information', 'disease_info')).toBe('monthly')
  })

  it('maps the head shape lab kinds', () => {
    expect(resolveCategory('head_shape_lab', 'exercise_guide')).toBe('exercise-guide')
    expect(resolveCategory('head_shape_lab', 'disease_info')).toBe('disease-info')
    expect(resolveCategory('head_shape_lab', 'faq')).toBe('faq')
  })
})

describe('resolveTrack', () => {
  it('returns both when the article targets the two tracks', () => {
    expect(resolveTrack(['head_shape', 'torticollis'])).toBe('both')
  })

  it('returns the single track', () => {
    expect(resolveTrack(['torticollis'])).toBe('torticollis')
    expect(resolveTrack(['head_shape'])).toBe('head_shape')
  })

  it('treats an empty list as both', () => {
    expect(resolveTrack([])).toBe('both')
  })
})

describe('resolveExcerpt', () => {
  it('prefers the summary', () => {
    expect(resolveExcerpt({ summary: '요약입니다.', subtitle: '부제입니다.', document: [] })).toBe('요약입니다.')
  })

  it('falls back to the subtitle when there is no summary', () => {
    expect(resolveExcerpt({ summary: null, subtitle: '부제입니다.', document: [] })).toBe('부제입니다.')
  })

  it('falls back to the first paragraph of the first markdown node', () => {
    const excerpt = resolveExcerpt({
      summary: null,
      subtitle: null,
      document: [
        { type: 'markdown', markdown: '# 제목만 있는 첫 덩어리\n\n**본문** 첫 문단입니다.\n\n둘째 문단입니다.' },
      ],
    })
    expect(excerpt).toBe('제목만 있는 첫 덩어리')
  })

  it('cuts the fallback at 120 characters', () => {
    const long = '가'.repeat(200)
    const excerpt = resolveExcerpt({ summary: null, subtitle: null, document: [{ type: 'markdown', markdown: long }] })
    expect(excerpt).toHaveLength(123)
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('returns an empty string when there is nothing to show', () => {
    expect(resolveExcerpt({ summary: '  ', subtitle: null, document: [] })).toBe('')
  })
})

describe('truncate', () => {
  it('keeps an emoji whole when it sits on the cut boundary', () => {
    const head = '가'.repeat(119)
    const cut = truncate(`${head}👍${'나'.repeat(50)}`)
    expect(cut).toBe(`${head}👍...`)
    expect(hasLoneSurrogate(cut)).toBe(false)
  })

  it('stops before an emoji that starts past the limit', () => {
    const head = '가'.repeat(120)
    const cut = truncate(`${head}👍${'나'.repeat(50)}`)
    expect(cut).toBe(`${head}...`)
    expect(hasLoneSurrogate(cut)).toBe(false)
  })
})

describe('stripMarkdown', () => {
  it('removes markers, links and images', () => {
    expect(stripMarkdown('## **굵은** 제목 [링크](https://a.test) ![이미지](lab-asset:x) `코드`')).toBe(
      '굵은 제목 링크 코드',
    )
  })
})

describe('estimateReadingMinutes', () => {
  it('rounds the duration up to whole minutes', () => {
    expect(estimateReadingMinutes({ durationSeconds: 240, text: '' })).toBe(4)
    expect(estimateReadingMinutes({ durationSeconds: 61, text: '' })).toBe(2)
  })

  it('estimates one minute per 500 non space characters when there is no duration', () => {
    expect(estimateReadingMinutes({ durationSeconds: null, text: '가'.repeat(1200) })).toBe(3)
  })

  it('never returns less than one minute', () => {
    expect(estimateReadingMinutes({ durationSeconds: null, text: '' })).toBe(1)
    expect(estimateReadingMinutes({ durationSeconds: 0, text: '' })).toBe(1)
  })
})

describe('monthLabel', () => {
  it('returns null when there is no month placement', () => {
    expect(monthLabel(monthLabels, null, null)).toBeNull()
  })

  it('returns the open ended label when monthMax is null', () => {
    expect(monthLabel(monthLabels, 13, null)).toBe('13개월 이상')
  })

  it('returns a single month label', () => {
    expect(monthLabel(monthLabels, 4, 4)).toBe('4개월')
  })

  it('returns a span label', () => {
    expect(monthLabel(monthLabels, 4, 6)).toBe('4개월부터 6개월')
  })
})

describe('blocksToDocument', () => {
  it('turns v1 blocks into a single markdown node with headings at level two', () => {
    expect(blocksToDocument(legacyBlocksContent.schemaVersion === 1 ? legacyBlocksContent.blocks : [])).toEqual([
      { type: 'markdown', markdown: '## 정의\n\n머리 뒤쪽 한 곳이 납작해진 상태를 말합니다.' },
    ])
  })

  it('returns an empty document for empty blocks', () => {
    expect(blocksToDocument([])).toEqual([])
  })
})

describe('documentText', () => {
  it('walks callout and disclosure children', () => {
    const text = documentText([
      { type: 'markdown', markdown: '겉 문단' },
      { type: 'callout', icon: null, children: [{ type: 'markdown', markdown: '콜아웃 문단' }] },
      { type: 'disclosure', title: '접기 제목', children: [{ type: 'markdown', markdown: '접기 문단' }] },
    ])
    expect(text).toContain('겉 문단')
    expect(text).toContain('콜아웃 문단')
    expect(text).toContain('접기 제목')
    expect(text).toContain('접기 문단')
  })
})

describe('formatPublishedDate', () => {
  it('keeps the date part only', () => {
    expect(formatPublishedDate('2026-09-11T02:00:00Z')).toBe('2026-09-11')
  })
})

describe('toLabArticleCard', () => {
  it('maps a head shape lab card', () => {
    const card = toLabArticleCard(headShapeLabCards[0], { collection: 'head_shape_lab', locale: 'ko' })
    expect(card).toMatchObject({
      id: exerciseContent.id,
      revisionId: exerciseContent.revisionId,
      category: 'exercise-guide',
      kind: 'exercise_guide',
      title: '도리도리 운동 따라 하기',
      subtitle: '하루 세 번 3분이면 충분해요',
      track: 'both',
      monthMin: null,
      monthMax: null,
      readingMinutes: 4,
      locale: 'ko',
    })
    expect(card.excerpt).toBe(exerciseContent.summary)
  })

  it('uses the hero asset url when there is no thumbnail', () => {
    const card = toLabArticleCard(headShapeLabCards[0], { collection: 'head_shape_lab', locale: 'ko' })
    expect(card.heroImage).toContain(`/contents/${exerciseContent.id}/revisions/${exerciseContent.revisionId}/assets/`)
  })

  it('prefers the thumbnail url and reads the month placement', () => {
    const card = toLabArticleCard(monthlyCards[0], { collection: 'home_monthly_information', locale: 'ko' })
    expect(card).toMatchObject({
      category: 'monthly',
      track: 'torticollis',
      monthMin: 13,
      monthMax: null,
      heroImage: 'https://cdn.barodori.com/lab/monthly-13.png',
      title: '13개월 이후의 목 관찰',
      subtitle: '걷기 시작한 뒤에 볼 것',
    })
  })

  it('falls back to the subtitle when there is no summary', () => {
    const card = toLabArticleCard(monthlyCards[0], { collection: 'home_monthly_information', locale: 'ko' })
    expect(card.excerpt).toBe('걷기 시작한 뒤에 볼 것')
  })

  it('leaves the excerpt empty when there is neither a summary nor a subtitle', () => {
    // 카드에는 본문이 없어 첫 문단 대체가 닿지 않는다. 목록 UI가 빈 문자열을 감당해야 한다.
    const legacyCard = headShapeLabCards[1]
    expect(legacyCard.summary).toBeNull()
    const card = toLabArticleCard(legacyCard, { collection: 'head_shape_lab', locale: 'ko' })
    expect(card.subtitle).toBeNull()
    expect(card.excerpt).toBe('')
  })
})

describe('matchesQuery', () => {
  const card = toLabArticleCard(headShapeLabCards[0], { collection: 'head_shape_lab', locale: 'ko' })

  it('matches an empty query', () => {
    expect(matchesQuery(card, '')).toBe(true)
    expect(matchesQuery(card, '   ')).toBe(true)
  })

  it('matches the title, the subtitle and the excerpt', () => {
    expect(matchesQuery(card, '도리도리')).toBe(true)
    expect(matchesQuery(card, '하루 세 번')).toBe(true)
    expect(matchesQuery(card, '목을 부드럽게')).toBe(true)
  })

  it('ignores letter case', () => {
    const english = { ...card, title: 'Tummy Time', subtitle: null, excerpt: '' }
    expect(matchesQuery(english, 'tummy')).toBe(true)
    expect(matchesQuery(english, 'TIME')).toBe(true)
  })

  it('returns false when nothing matches', () => {
    expect(matchesQuery(card, '사두증')).toBe(false)
  })
})

describe('toLabArticle', () => {
  it('keeps the render document and the asset manifest for a markdown article', () => {
    const article = toLabArticle(exerciseContent, { collection: 'head_shape_lab', locale: 'ko' })
    expect(article.document).toHaveLength(3)
    expect(article.assets).toHaveLength(2)
    expect(article.category).toBe('exercise-guide')
  })

  it('converts a v1 blocks article to a markdown document', () => {
    const article = toLabArticle(legacyBlocksContent, { collection: 'head_shape_lab', locale: 'ko' })
    expect(article.document).toEqual([
      { type: 'markdown', markdown: '## 정의\n\n머리 뒤쪽 한 곳이 납작해진 상태를 말합니다.' },
    ])
    expect(article.assets).toEqual([])
  })

  it('picks the head shape lab placement when an article sits in both collections', () => {
    const both = {
      ...faqContent,
      placements: [
        { collection: 'home_monthly_information' as const, order: 0, monthMin: 2, monthMax: 3 },
        { collection: 'head_shape_lab' as const, order: 1, monthMin: null, monthMax: null },
      ],
    }
    expect(toLabArticle(both, { collection: null, locale: 'ko' }).category).toBe('faq')
  })

  it('reads the monthly placement when that collection is requested', () => {
    const article = toLabArticle(monthlyContent, { collection: 'home_monthly_information', locale: 'ko' })
    expect(article.monthMin).toBe(13)
    expect(article.monthMax).toBeNull()
  })
})
