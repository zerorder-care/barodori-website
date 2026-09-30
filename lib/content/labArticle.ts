import {
  labAssetUrl,
  type LabAsset,
  type LabBlock,
  type LabCard,
  type LabCollection,
  type LabContent,
  type LabKind,
  type LabPlacement,
  type LabRenderNode,
  type LabTrack,
} from '@/lib/api/knowledgeLab'
import type { ArticleCategory } from '@/lib/content/categories'
import type { Locale } from '@/lib/i18n/config'

export type ArticleTrack = LabTrack | 'both'

export type LabArticleCard = {
  id: string
  revisionId: string
  category: ArticleCategory
  kind: LabKind
  title: string
  subtitle: string | null
  excerpt: string
  heroImage: string | null
  track: ArticleTrack
  monthMin: number | null
  monthMax: number | null
  publishedAt: string
  readingMinutes: number
  locale: Locale
}

export type LabArticle = LabArticleCard & {
  document: LabRenderNode[]
  assets: LabAsset[]
}

export type MonthLabels = {
  monthRange: string
  monthRangeSpan: string
  monthPlus: string
}

const EXCERPT_MAX_LENGTH = 120
const CHARACTERS_PER_MINUTE = 500

// 부제 괄호 안의 라벨. "부제:"와 "부제 ：" 처럼 공백과 전각 콜론을 함께 받는다.
const SUBTITLE_LABEL_PATTERN = /^부제\s*[:：]\s*/

/**
 * 문자열 끝에 붙은 최상위 괄호 한 쌍의 여는 위치를 찾는다. 괄호가 중첩되어 있어도
 * 짝을 세어 바깥 괄호를 고르고, 짝이 맞지 않으면 -1을 돌려준다.
 */
function trailingGroupStart(text: string): number {
  if (!text.endsWith(')')) return -1
  let depth = 0
  for (let index = text.length - 1; index >= 0; index -= 1) {
    const char = text[index]
    if (char === ')') depth += 1
    else if (char === '(') {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return -1
}

/**
 * "본제목(부제: 부제)" 형태를 본제목과 부제로 가른다. 끝 괄호가 "부제:" 라벨로 시작할 때만
 * 부제로 보고, 라벨이 없는 괄호는 제목의 일부로 남긴다. 부제 안의 괄호는 그대로 살린다.
 */
export function splitTitle(raw: string): { title: string; subtitle: string | null } {
  const trimmed = raw.trim()
  const start = trailingGroupStart(trimmed)
  if (start < 0) return { title: trimmed, subtitle: null }

  const head = trimmed.slice(0, start).trim()
  if (head.length === 0) return { title: trimmed, subtitle: null }

  const inner = trimmed.slice(start + 1, trimmed.length - 1)
  if (!SUBTITLE_LABEL_PATTERN.test(inner)) return { title: trimmed, subtitle: null }

  const subtitle = inner.replace(SUBTITLE_LABEL_PATTERN, '').trim()
  return { title: head, subtitle: subtitle.length > 0 ? subtitle : null }
}

export function resolveCategory(collection: LabCollection, kind: LabKind): ArticleCategory {
  if (collection === 'home_monthly_information') return 'monthly'
  if (kind === 'exercise_guide') return 'exercise-guide'
  if (kind === 'disease_info') return 'disease-info'
  return 'faq'
}

export function resolveTrack(targetTracks: LabTrack[]): ArticleTrack {
  if (targetTracks.length === 1) return targetTracks[0]
  return 'both'
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function firstParagraph(document: LabRenderNode[]): string {
  for (const node of document) {
    if (node.type !== 'markdown') continue
    for (const chunk of node.markdown.split(/\n{2,}/)) {
      const text = stripMarkdown(chunk)
      if (text.length > 0) return text
    }
  }
  return ''
}

/**
 * 글자를 자소 단위로 센다. 이모지나 결합 문자를 반으로 가르지 않기 위해서다.
 * Intl.Segmenter가 없는 런타임에서는 코드 포인트 단위로 물러선다.
 */
function toGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (part) => part.segment)
  }
  return Array.from(text)
}

export function truncate(text: string, max = EXCERPT_MAX_LENGTH): string {
  if (text.length <= max) return text
  const graphemes = toGraphemes(text)
  if (graphemes.length <= max) return text
  return `${graphemes.slice(0, max).join('')}...`
}

export function resolveExcerpt(input: {
  summary: string | null
  subtitle: string | null
  document: LabRenderNode[]
}): string {
  const summary = input.summary?.trim()
  if (summary) return summary
  const subtitle = input.subtitle?.trim()
  if (subtitle) return subtitle
  return truncate(firstParagraph(input.document))
}

export function estimateReadingMinutes(input: { durationSeconds: number | null; text: string }): number {
  if (input.durationSeconds && input.durationSeconds > 0) {
    return Math.max(1, Math.ceil(input.durationSeconds / 60))
  }
  const compactLength = input.text.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(compactLength / CHARACTERS_PER_MINUTE))
}

export function documentText(document: LabRenderNode[]): string {
  const parts: string[] = []
  const walk = (nodes: LabRenderNode[]) => {
    for (const node of nodes) {
      if (node.type === 'markdown') {
        parts.push(stripMarkdown(node.markdown))
        continue
      }
      if (node.type === 'disclosure') parts.push(node.title)
      walk(node.children)
    }
  }
  walk(document)
  return parts.join('\n')
}

export function blocksToDocument(blocks: LabBlock[]): LabRenderNode[] {
  const markdown = blocks
    .map((block) => {
      const text = block.text.trim()
      if (text.length === 0) return ''
      return block.type === 'heading' ? `## ${text}` : text
    })
    .filter((part) => part.length > 0)
    .join('\n\n')
  return markdown.length > 0 ? [{ type: 'markdown', markdown }] : []
}

export function toDocument(content: LabContent): LabRenderNode[] {
  return content.schemaVersion === 2 ? content.renderDocument : blocksToDocument(content.blocks)
}

export function monthLabel(labels: MonthLabels, monthMin: number | null, monthMax: number | null): string | null {
  if (monthMin === null) return null
  if (monthMax === null) return labels.monthPlus
  if (monthMax === monthMin) return labels.monthRange.replace('{min}', String(monthMin))
  return labels.monthRangeSpan.replace('{min}', String(monthMin)).replace('{max}', String(monthMax))
}

export function formatPublishedDate(publishedAt: string): string {
  return publishedAt.slice(0, 10)
}

/**
 * 요청한 컬렉션의 배치를 고른다. 컬렉션을 지정하지 않으면(상세 페이지) 두상연구소 배치를 먼저 본다.
 * 한 콘텐츠는 배치를 최대 두 개 가진다.
 */
export function placementFor(
  placements: LabPlacement[],
  collection: LabCollection | null,
): LabPlacement | null {
  if (collection) return placements.find((placement) => placement.collection === collection) ?? null
  return (
    placements.find((placement) => placement.collection === 'head_shape_lab') ??
    placements[0] ??
    null
  )
}

type MapOptions = {
  collection: LabCollection | null
  locale: Locale
}

export function toLabArticleCard(card: LabCard, options: MapOptions): LabArticleCard {
  const placement = placementFor(card.placements, options.collection)
  const collection = placement?.collection ?? 'head_shape_lab'
  const { title, subtitle } = splitTitle(card.title)
  const heroImage =
    card.thumbnailUrl ??
    (card.heroAsset
      ? labAssetUrl({
          contentId: card.id,
          revisionId: card.revisionId,
          assetVersionId: card.heroAsset.assetVersionId,
          locale: options.locale,
        })
      : null)

  return {
    id: card.id,
    revisionId: card.revisionId,
    category: resolveCategory(collection, card.kind),
    kind: card.kind,
    title,
    subtitle,
    // 목록 카드에는 본문이 없으므로 세 번째 대체인 첫 문단은 쓸 수 없다.
    // 요약도 부제도 없으면 excerpt는 빈 문자열이고, 목록 UI가 그 경우를 감당해야 한다.
    excerpt: resolveExcerpt({ summary: card.summary, subtitle, document: [] }),
    heroImage: heroImage && heroImage.length > 0 ? heroImage : null,
    track: resolveTrack(card.targetTracks),
    monthMin: placement?.monthMin ?? null,
    monthMax: placement?.monthMax ?? null,
    publishedAt: card.publishedAt,
    readingMinutes: estimateReadingMinutes({
      durationSeconds: card.durationSeconds,
      text: `${card.title} ${card.summary ?? ''}`,
    }),
    locale: options.locale,
  }
}

export function toLabArticle(content: LabContent, options: MapOptions): LabArticle {
  const placement = placementFor(content.placements, options.collection)
  const collection = placement?.collection ?? 'head_shape_lab'
  const { title, subtitle } = splitTitle(content.title)
  const document = toDocument(content)
  const assets = content.schemaVersion === 2 ? content.markdownAssets : []
  const firstImage = assets.find((asset) => asset.role === 'image')
  const heroImage =
    content.thumbnailUrl ??
    (firstImage
      ? labAssetUrl({
          contentId: content.id,
          revisionId: content.revisionId,
          assetVersionId: firstImage.assetVersionId,
          locale: options.locale,
        })
      : null)

  return {
    id: content.id,
    revisionId: content.revisionId,
    category: resolveCategory(collection, content.kind),
    kind: content.kind,
    title,
    subtitle,
    excerpt: resolveExcerpt({ summary: content.summary, subtitle, document }),
    heroImage: heroImage && heroImage.length > 0 ? heroImage : null,
    track: resolveTrack(content.targetTracks),
    monthMin: placement?.monthMin ?? null,
    monthMax: placement?.monthMax ?? null,
    publishedAt: content.publishedAt,
    readingMinutes: estimateReadingMinutes({
      durationSeconds: content.durationSeconds,
      text: `${content.summary ?? ''}\n${documentText(document)}`,
    }),
    locale: options.locale,
    document,
    assets,
  }
}

/** 목록 카드에서 검색어를 거른다. 본제목, 부제, 요약을 본다. */
export function matchesQuery(card: LabArticleCard, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) return true
  return `${card.title} ${card.subtitle ?? ''} ${card.excerpt}`.toLowerCase().includes(normalized)
}
