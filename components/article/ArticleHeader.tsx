import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { categoryLabels } from '@/lib/content/categories'
import type { Article } from '@/lib/content/articles'

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="mb-8">
      <Badge>{categoryLabels[article.category][article.locale]}</Badge>
      <h1 className="mt-3 text-3xl font-bold leading-snug sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">{article.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
        <span>{article.author}</span>
        {article.authorRole && <span className="text-[var(--color-primary-dark)]">· {article.authorRole}</span>}
        <span>· {article.publishedAt}</span>
        <span>· {article.readingMinutes}분 읽기</span>
      </div>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
        <Image
          src={article.heroImage}
          alt={article.heroImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>
    </header>
  )
}
