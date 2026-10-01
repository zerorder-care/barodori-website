import { Badge } from '@/components/ui/Badge'
import { articleCategoryLabels } from '@/lib/content/categories'
import { formatPublishedDate, monthLabel, type LabArticle, type MonthLabels } from '@/lib/content/labArticle'

export type LabArticleHeaderLabels = MonthLabels & {
  author: string
  readingTime: string
}

export function LabArticleHeader({ article, labels }: { article: LabArticle; labels: LabArticleHeaderLabels }) {
  const month = monthLabel(labels, article.monthMin, article.monthMax)

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{articleCategoryLabels[article.category][article.locale]}</Badge>
        {month && <Badge tone="neutral">{month}</Badge>}
      </div>
      <h1 className="mt-3 text-3xl font-bold leading-snug tracking-tight sm:text-4xl">{article.title}</h1>
      {article.subtitle && (
        <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {article.subtitle}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
        <span>{labels.author}</span>
        <span>{formatPublishedDate(article.publishedAt)}</span>
        <span>{labels.readingTime.replace('{minutes}', String(article.readingMinutes))}</span>
      </div>
    </header>
  )
}
