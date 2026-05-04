import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Article } from '@/lib/content/articles'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.locale}/articles/${article.slug}`}
      className="group block overflow-hidden rounded-lg border border-[--color-border] bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] bg-[--color-bg-muted]">
        <Image src={article.heroImage} alt={article.heroImageAlt} fill className="object-cover" />
      </div>
      <div className="p-4">
        <Badge>{categoryLabels[article.category][article.locale]}</Badge>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold group-hover:underline">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-[--color-text-secondary]">{article.excerpt}</p>
        <p className="mt-2 text-xs text-[--color-text-secondary]">{article.publishedAt} · {article.readingMinutes}분</p>
      </div>
    </Link>
  )
}
