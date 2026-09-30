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

// "본제목(부제: 부제)" 형태에서 마지막 괄호를 부제로 본다. 괄호 안 라벨은 있어도 되고 없어도 된다.
const TITLE_SUBTITLE_PATTERN = /^(.*\S)\s*\(\s*(?:부제\s*[:：]\s*)?([^()]*)\)\s*$/

export function splitTitle(raw: string): { title: string; subtitle: string | null } {
  const trimmed = raw.trim()
  const matched = TITLE_SUBTITLE_PATTERN.exec(trimmed)
  if (!matched) return { title: trimmed, subtitle: null }
  const subtitle = matched[2].trim()
  return { title: matched[1].trim(), subtitle: subtitle.length > 0 ? subtitle : null }
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

export function truncate(text: string, max = EXCERPT_MAX_LENGTH): string {
  return text.length <= max ? text : `${text.slice(0, max)}...`
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
