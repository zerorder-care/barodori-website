import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Article } from '@/lib/content/articles'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.locale}/articles/${article.slug}`}
      className="group block overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white transition hover:shadow-md"
    >
      <div className="grid aspect-[16/9] place-items-center border-b border-dashed border-[#b9b9b9] bg-[#e6e6e6] text-xs text-[var(--color-text-secondary)]">
        대표 이미지
      </div>
      <div className="p-6">
        <Badge>{categoryLabels[article.category][article.locale]}</Badge>
        <h3 className="mt-4 line-clamp-2 min-h-12 text-lg font-bold leading-snug group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{article.excerpt}</p>
        <p className="mt-5 text-xs text-[var(--color-text-secondary)]">{article.publishedAt} · {article.readingMinutes}분</p>
      </div>
    </Link>
  )
}
