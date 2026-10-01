import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { articleCategoryLabels, type ArticleCategory } from '@/lib/content/categories'
import { formatPublishedDate, type LabArticleCard as LabArticleCardModel } from '@/lib/content/labArticle'

// 대표 이미지가 없을 때 이미지 영역에 두는 분류별 옅은 배경이다.
const HERO_FALLBACK_CLASS: Record<ArticleCategory, string> = {
  'exercise-guide': 'bg-[var(--color-primary-light)]',
  'disease-info': 'bg-amber-50',
  faq: 'bg-[var(--color-bg-muted)]',
  monthly: 'bg-sky-50',
}

export function LabArticleCard({
  card,
  readingTimeLabel,
}: {
  card: LabArticleCardModel
  readingTimeLabel: string
}) {
  const meta = `${formatPublishedDate(card.publishedAt)}, ${readingTimeLabel.replace(
    '{minutes}',
    String(card.readingMinutes),
  )}`

  return (
    <Link
      href={`/${card.locale}/articles/${card.id}`}
      className="group block overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white transition hover:shadow-md"
    >
      <div
        className={`relative aspect-[16/9] border-b border-[var(--color-border)] ${HERO_FALLBACK_CLASS[card.category]}`}
      >
        {card.heroImage && (
          // 백엔드 자산은 크기를 알 수 없어 next/image를 쓰지 않는다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.heroImage}
            alt={card.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="p-6">
        <Badge>{articleCategoryLabels[card.category][card.locale]}</Badge>
        <h3 className="mt-4 line-clamp-2 min-h-12 text-lg font-bold leading-snug group-hover:underline">
          {card.title}
        </h3>
        {card.excerpt && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{card.excerpt}</p>
        )}
        <p className="mt-5 text-xs text-[var(--color-text-secondary)]">{meta}</p>
      </div>
    </Link>
  )
}
